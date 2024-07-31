import { NextResponse, type NextRequest } from "next/server";
import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { submitBallot } from "@/app/api/common/ballots/submitBallot";
import { z } from "zod";
import { fetchIsCitizen } from "@/app/api/common/citizens/isCitizen";

const ballotContentSchema = z.object({
  allocations: z.array(z.record(z.string(), z.number())),
  os_only: z.boolean(),
  os_multiplier: z.number(),
});

const ballotSubmissionSchema = z.object({
  ballot_content: ballotContentSchema,
  signature: z.string().regex(/^0x[a-fA-F0-9]{130}$/),
});

export type BallotSubmission = z.infer<typeof ballotSubmissionSchema>;

export async function POST(
  request: NextRequest,
  route: { params: { roundId: string; ballotCasterAddressOrEns: string } }
) {
  const isBadgeholder = await fetchIsCitizen(
    route.params.ballotCasterAddressOrEns
  );

  if (!isBadgeholder) {
    return new Response("Only badgeholder can submit a ballot", {
      status: 401,
    });
  }

  return new Response("Ballot submission for Round 4 is closed", {
    status: 403,
  });

  return await traceWithUserId(
    route.params.ballotCasterAddressOrEns as string,
    async () => {
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
    }
  );
}
