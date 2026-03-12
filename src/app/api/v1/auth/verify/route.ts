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

    const verification = await verifyMessage({
      address: siweObject.address as `0x${string}`,
      message,
      signature,
      chainId: siweObject.chainId,
      allowSafeContractSignature: true,
    });

    if (verification) {
      await appendServerTraceEvent({
        traceContext,
        eventName: "siwe_verify_succeeded",
      });
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
