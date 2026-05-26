import { type NextRequest, NextResponse } from "next/server";
import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import { getMiradorTraceContextFromHeaders } from "@/lib/mirador/requestContext";
import {
  appendServerTraceEvent,
  withMiradorTraceStep,
} from "@/lib/mirador/serverTrace";
import { withApiRouteMonitoring } from "@/lib/apiMonitoring";
import { getRelayVoteClientError, getRelayVoteErrorMessage } from "./errors";

async function post(request: NextRequest) {
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
    appendServerTraceEvent({
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
    appendServerTraceEvent({
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
    const errorMessage = getRelayVoteErrorMessage(e);
    const clientError = getRelayVoteClientError(e);

    appendServerTraceEvent({
      traceContext: withMiradorTraceStep(
        traceContext,
        "relay_vote_request_failed",
        "api"
      ),
      eventName: "relay_vote_request_failed",
      details: {
        message: errorMessage,
        code: clientError?.code,
        status: clientError?.status ?? 500,
      },
    });

    if (clientError) {
      return NextResponse.json(
        {
          error: clientError.error,
          code: clientError.code,
        },
        { status: clientError.status }
      );
    }

    return new Response("Internal server error", {
      status: 500,
    });
  }
}

export const POST = withApiRouteMonitoring("api.v1.relay.vote", post);
