import { type NextRequest, NextResponse } from "next/server";
import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import { getMiradorTraceContextFromHeaders } from "@/lib/mirador/requestContext";
import {
  appendServerTraceEvent,
  withMiradorTraceStep,
} from "@/lib/mirador/serverTrace";

export async function POST(request: NextRequest) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { z } = await import("zod");
  const { voteBySignatureApi } = await import("./castVote");
  const baseTraceContext = getMiradorTraceContextFromHeaders(request);
  const traceContext = baseTraceContext
    ? {
        ...baseTraceContext,
        flow: baseTraceContext.flow ?? MIRADOR_FLOW.governanceVote,
      }
    : undefined;

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    await appendServerTraceEvent({
      traceContext: withMiradorTraceStep(
        traceContext,
        "relay_vote_auth",
        "api"
      ),
      eventName: "relay_vote_auth_failed",
      details: { reason: authResponse.failReason },
    });
    return new Response(authResponse.failReason, { status: 401 });
  }

  try {
    const body = await request.json();

    const voteRequestSchema = z.object({
      signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
      proposalId: z.string(),
      support: z.number(),
    });

    const parsedBody = voteRequestSchema.parse(body);
    await appendServerTraceEvent({
      traceContext: withMiradorTraceStep(
        traceContext,
        "relay_vote_request_validated",
        "api"
      ),
      eventName: "relay_vote_request_validated",
      details: {
        proposalId: parsedBody.proposalId,
        support: parsedBody.support,
      },
    });

    const voteTxHash = await voteBySignatureApi({
      signature: parsedBody.signature as `0x${string}`,
      proposalId: parsedBody.proposalId,
      support: parsedBody.support,
      traceContext,
    });
    return NextResponse.json(voteTxHash);
  } catch (e: any) {
    await appendServerTraceEvent({
      traceContext: withMiradorTraceStep(
        traceContext,
        "relay_vote_request_failed",
        "api"
      ),
      eventName: "relay_vote_request_failed",
      details: {
        message: e instanceof Error ? e.message : String(e),
      },
    });
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
