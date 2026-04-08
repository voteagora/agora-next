import { NextRequest, NextResponse } from "next/server";
import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import { getMiradorTraceContextFromHeaders } from "@/lib/mirador/requestContext";
import {
  appendServerTraceEvent,
  withMiradorTraceStep,
} from "@/lib/mirador/serverTrace";

export async function POST(request: NextRequest) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { z } = await import("zod");
  const { delegateBySignatureApi } = await import("./delegate");
  const baseTraceContext = getMiradorTraceContextFromHeaders(request);
  const traceContext = baseTraceContext
    ? {
        ...baseTraceContext,
        flow: baseTraceContext.flow ?? MIRADOR_FLOW.governanceDelegation,
      }
    : undefined;

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    await appendServerTraceEvent({
      traceContext: withMiradorTraceStep(
        traceContext,
        "relay_delegate_auth",
        "api"
      ),
      eventName: "relay_delegate_auth_failed",
      details: { reason: authResponse.failReason },
    });
    return new Response(authResponse.failReason, { status: 401 });
  }

  try {
    const body = await request.json();
    const delegateRequestSchema = z.object({
      signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
      delegatee: z.string().regex(/^0x[a-fA-F0-9]+$/),
      nonce: z.string(),
      expiry: z.number(),
    });
    const parsedBody = delegateRequestSchema.parse(body);
    await appendServerTraceEvent({
      traceContext: withMiradorTraceStep(
        traceContext,
        "relay_delegate_request_validated",
        "api"
      ),
      eventName: "relay_delegate_request_validated",
      details: {
        delegatee: parsedBody.delegatee,
        nonce: parsedBody.nonce,
        expiry: parsedBody.expiry,
      },
    });

    const delegateTxHash = await delegateBySignatureApi({
      signature: parsedBody.signature as `0x${string}`,
      delegatee: parsedBody.delegatee as `0x${string}`,
      nonce: parsedBody.nonce,
      expiry: parsedBody.expiry,
      traceContext,
    });
    return NextResponse.json(delegateTxHash);
  } catch (e: any) {
    console.error("Error in delegate route", e);
    await appendServerTraceEvent({
      traceContext: withMiradorTraceStep(
        traceContext,
        "relay_delegate_request_failed",
        "api"
      ),
      eventName: "relay_delegate_request_failed",
      details: {
        message: e instanceof Error ? e.message : String(e),
      },
    });
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
