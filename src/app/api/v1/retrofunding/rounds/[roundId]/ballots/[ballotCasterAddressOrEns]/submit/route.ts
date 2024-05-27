import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { submitBallot } from "@/app/api/common/ballots/submitBallot";
import { z } from "zod";

const ballotSubmissionSchema = z.object({
  ballotContnet: z.array(
    z.object({
      metric_id: z.string(),
      allocation: z.number(),
    })
  ),
  signature: z.string(),
});

export async function POST(
  request: NextRequest,
  route: { params: { roundId: string; ballotCasterAddressOrEns: string } }
) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    const { roundId, ballotCasterAddressOrEns } = route.params;
    try {
      const payload = await request.json();
      const parsedPayload = ballotSubmissionSchema.parse(payload);

      const ballot = await submitBallot(
        parsedPayload,
        Number(roundId),
        ballotCasterAddressOrEns
      );
      return NextResponse.json(ballot);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
