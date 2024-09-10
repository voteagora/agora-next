import { NextResponse, type NextRequest } from "next/server";
import {
  authenticateApiUser,
  getCategoryScope,
  validateAddressScope,
} from "@/app/lib/auth/serverAuth";
import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { z } from "zod";
import { updateBallotCategory } from "@/app/api/common/ballots/updateBallotCategories";

const ballotPayloadSchema = z.object({
  category_slug: z.string(),
  allocation: z.number(),
  locked: z.boolean(),
});

export async function POST(
  request: NextRequest,
  route: { params: { roundId: string; ballotCasterAddressOrEns: string } }
) {
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

      const categoryScope = getCategoryScope(authResponse);

      if (!categoryScope) {
        return new Response(
          "This user does not have a category scope. Regenerate the JWT token",
          {
            status: 401,
          }
        );
      }

      const impactMetrics = await updateBallotCategory(
        parsedPayload,
        Number(roundId),
        categoryScope,
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
