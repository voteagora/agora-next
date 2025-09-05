export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { SiweMessage } = await import("siwe");
  const { default: verifyMessage } = await import("@/lib/serverVerifyMessage");
  const { generateJwt, getRolesForUser, getExpiry } = await import(
    "@/app/lib/auth/serverAuth"
  );

  try {
    const { message, signature } = await request.json();
    const siweObject = new SiweMessage(message);
    const hasJwtSecret = Boolean(process.env.JWT_SECRET);
    console.info("[SIWE] verify request", {
      address: siweObject.address,
      chainId: siweObject.chainId,
      domain: siweObject.domain,
      nonceLen: String(siweObject.nonce || "").length,
      hasJwtSecret,
    });

    let verification = false;
    try {
      verification = await verifyMessage({
        address: siweObject.address as `0x${string}`,
        message,
        signature,
      });
    } catch (e) {
      console.error("[SIWE] verifyMessage threw", e);
      verification = false;
    }

    // If EOA check failed, try EIP-1271 (SCW / multisig) fallback
    if (!verification) {
      try {
        const { getPublicClientByChainId } = await import("@/lib/viem");
        const { hashMessage } = await import("viem");
        const siweChainId = Number(siweObject.chainId || 0);
        const publicClient = getPublicClientByChainId(
          Number.isFinite(siweChainId) && siweChainId > 0
            ? siweChainId
            : undefined
        );

        const code = await publicClient.getBytecode({
          address: siweObject.address as `0x${string}`,
        });
        const isContract = !!code && code !== "0x";
        console.info("[SIWE] 1271 fallback", { isContract, siweChainId });
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
          const MAGIC = "0x1626ba7e";
          const msgHash = hashMessage(message);
          const res = (await publicClient.readContract({
            address: siweObject.address as `0x${string}`,
            abi: ERC1271_ABI,
            functionName: "isValidSignature",
            args: [msgHash, signature as `0x${string}`],
          })) as `0x${string}`;
          verification = res?.toLowerCase() === MAGIC;
          console.info("[SIWE] 1271 result", {
            res,
            verification,
            siweChainId,
          });
        }
      } catch (e) {
        console.error("[SIWE] 1271 fallback error", e);
      }
    }

    if (!verification) {
      console.warn("[SIWE] invalid signature", {
        address: siweObject.address,
        chainId: siweObject.chainId,
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
    return NextResponse.json(responseBody);
  } catch (e) {
    const hasJwtSecret = Boolean(process.env.JWT_SECRET);
    console.error("[SIWE] /auth/verify error", { hasJwtSecret, error: e });
    return new Response("Internal server error", { status: 500 });
  }
}
