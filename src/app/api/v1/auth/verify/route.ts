export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse, type NextRequest } from "next/server";
import { appendServerTraceEvent } from "@/lib/mirador/serverTrace";
import { getMiradorTraceContextFromHeaders } from "@/lib/mirador/requestContext";
import { verifySiweLogin } from "@/lib/siweAuth.server";

export async function POST(request: NextRequest) {
  const { generateJwt, getRolesForUser, getExpiry } = await import(
    "@/app/lib/auth/serverAuth"
  );
  const baseTraceContext = getMiradorTraceContextFromHeaders(request);
  const requestUrl = new URL(request.url);

  try {
    const { message, signature } = await request.json();
    const { SiweMessage } = await import("siwe");
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

    const verification = await verifySiweLogin({
      expectedHost: requestUrl.host,
      message,
      signature,
    });

    if (verification.ok) {
      await appendServerTraceEvent({
        traceContext,
        eventName: "siwe_verify_succeeded",
      });
    }

    if (!verification.ok) {
      await appendServerTraceEvent({
        traceContext,
        eventName: "siwe_verify_failed",
        details: { reason: verification.reason },
      });
      return NextResponse.json(
        { message: verification.reason },
        { status: 401 }
      );
    }

    // create JWT
    const verifiedMessage = verification.siweMessage;
    const scope = await getRolesForUser(
      verifiedMessage.address,
      verifiedMessage
    );
    const ttl = await getExpiry();
    const jwt = await generateJwt(verifiedMessage.address, scope, ttl, {
      address: verifiedMessage.address,
      chainId: `${verifiedMessage.chainId}`,
      nonce: verifiedMessage.nonce,
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
