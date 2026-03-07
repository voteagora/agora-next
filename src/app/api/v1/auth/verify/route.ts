export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse, type NextRequest } from "next/server";
import { appendServerTraceEvent } from "@/lib/mirador/serverTrace";
import { getMiradorTraceContextFromHeaders } from "@/lib/mirador/requestContext";

export async function POST(request: NextRequest) {
  const { SiweMessage } = await import("siwe");
  const { default: verifyMessage } = await import("@/lib/serverVerifyMessage");
  const { generateJwt, getRolesForUser, getExpiry } = await import(
    "@/app/lib/auth/serverAuth"
  );
  const { EIP1271_MAGIC_VALUE } = await import("@/lib/constants");
  const baseTraceContext = getMiradorTraceContextFromHeaders(request);

  try {
    const { message, signature } = await request.json();
    // Parse the exact message signed by the client (EIP-4361)
    const siweObject = new SiweMessage(message);
    const traceContext = baseTraceContext
      ? {
          ...baseTraceContext,
          step: "siwe_verify",
          source: "api" as const,
          walletAddress: siweObject.address as `0x${string}`,
          chainId: siweObject.chainId,
        }
      : undefined;

    await appendServerTraceEvent({
      traceContext,
      eventName: "siwe_verify_started",
    });

    let verification = false;
    try {
      verification = await verifyMessage({
        address: siweObject.address as `0x${string}`,
        message,
        signature,
      });
    } catch (e) {
      verification = false;
    }

    if (verification) {
      await appendServerTraceEvent({
        traceContext,
        eventName: "siwe_eoa_verify_succeeded",
      });
    }

    // If EOA check failed, try EIP-1271 (SCW / multisig) fallback
    if (!verification) {
      await appendServerTraceEvent({
        traceContext,
        eventName: "siwe_1271_fallback_attempted",
      });
      try {
        const { getPublicClient } = await import("@/lib/viem");
        const { hashMessage } = await import("viem");
        const publicClient = getPublicClient();

        const code = await publicClient.getBytecode({
          address: siweObject.address as `0x${string}`,
        });
        const isContract = !!code && code !== "0x";
        if (isContract) {
          const ERC1271_ABI = [
            {
              type: "function",
              name: "isValidSignature",
              stateMutability: "view",
              inputs: [
                { name: "hash", type: "bytes32" },
                { name: "signature", type: "bytes" },
              ],
              outputs: [{ name: "magicValue", type: "bytes4" }],
            },
          ] as const;
          // Compare with the standard EIP-1271 magic value indicating a valid signature
          const msgHash = hashMessage(message);
          const res = (await publicClient.readContract({
            address: siweObject.address as `0x${string}`,
            abi: ERC1271_ABI,
            functionName: "isValidSignature",
            args: [msgHash, signature as `0x${string}`],
          })) as `0x${string}`;
          verification = res?.toLowerCase() === EIP1271_MAGIC_VALUE;
          if (verification) {
            await appendServerTraceEvent({
              traceContext,
              eventName: "siwe_1271_fallback_succeeded",
            });
          }
        }
      } catch (e) {
        // ignore
      }
    }

    if (!verification) {
      await appendServerTraceEvent({
        traceContext,
        eventName: "siwe_verify_failed",
      });
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 }
      );
    }

    // create JWT
    const scope = await getRolesForUser(siweObject.address, siweObject);
    const ttl = await getExpiry();
    const jwt = await generateJwt(siweObject.address, scope, ttl, {
      address: siweObject.address,
      chainId: `${siweObject.chainId}`,
      nonce: siweObject.nonce,
    });

    const responseBody = {
      access_token: jwt,
      token_type: "JWT",
      expires_in: ttl,
    };
    await appendServerTraceEvent({
      traceContext,
      eventName: "siwe_jwt_issued",
    });
    return NextResponse.json(responseBody);
  } catch (e) {
    await appendServerTraceEvent({
      traceContext: baseTraceContext
        ? { ...baseTraceContext, step: "siwe_verify", source: "api" }
        : undefined,
      eventName: "siwe_verify_failed",
      details: { message: "Internal server error" },
    });
    return new Response("Internal server error", { status: 500 });
  }
}
