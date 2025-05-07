import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { traceWithUserId } from "@/app/api/v1/apiUtils";


const ballotPayloadSchema = z.object({
  metric_id: z.string(),
  allocation: z.number(),
  locked: z.boolean(),
});

export async function POST(
  request: NextRequest,
  route: { params: { roundId: string; ballotCasterAddressOrEns: string } }
) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { validateAddressScope } = await import("@/app/lib/auth/serverAuth");
  
  const { updateBallotMetric } = await import(
    "@/app/api/common/ballots/updateBallot"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const { roundId, ballotCasterAddressOrEns } = route.params;
  const scopeError = await validateAddressScope(
    ballotCasterAddressOrEns,
    authResponse
  );
  if (scopeError) return scopeError;

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const payload = await request.json();
      const parsedPayload = ballotPayloadSchema.parse(payload);

      const impactMetrics = await updateBallotMetric(
        parsedPayload,
        Number(roundId),
        ballotCasterAddressOrEns
      );
      return NextResponse.json(impactMetrics);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
