import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { traceWithUserId } from "@/app/api/v1/apiUtils";

const ballotPayloadSchema = z.object({
  projects: z.array(
    z.object({
      project_id: z.string(),
      allocation: z.string(z.number().min(0).max(100)).nullable(),
      impact: z.number(),
    })
  ),
});

export async function POST(
  request: NextRequest,
  route: { params: Promise<{ roundId: string; ballotCasterAddressOrEns: string }> }
) {
  const { roundId, ballotCasterAddressOrEns } = await route.params;
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { validateAddressScope } = await import("@/app/lib/auth/serverAuth");

  const { updateAllProjectsInBallot } = await import(
    "@/app/api/common/ballots/updateBallotProject"
  );
  const { getCategoryScope } = await import("@/app/lib/auth/serverAuth");

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const scopeError = await validateAddressScope(
    ballotCasterAddressOrEns,
    authResponse
  );
  if (scopeError) return scopeError;

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const categoryScope = getCategoryScope(authResponse);

      if (!categoryScope) {
        return new Response(
          "This user does not have a category scope. Regenerate the JWT token",
          {
            status: 401,
          }
        );
      }

      const payload = await request.json();
      const parsedPayload = ballotPayloadSchema.parse(payload);

      const ballot = await updateAllProjectsInBallot(
        parsedPayload.projects,
        categoryScope,
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
