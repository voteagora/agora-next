import { NextResponse, type NextRequest } from "next/server";
import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { submitBallot } from "@/app/api/common/ballots/submitBallot";
import { z } from "zod";

const r4BallotContentSchema = z.object({
  allocations: z.array(z.record(z.string(), z.number())),
  os_only: z.boolean(),
  os_multiplier: z.number(),
});

const r5BallotContentSchema = z.object({
  budget: z.number().min(2000000).max(8000000), // number between 2M and 8M
  project_allocations: z.array(
    z.record(z.string(), z.number().min(0).max(100))
  ),
  category_allocations: z.array(
    z.record(z.string(), z.number().min(0).max(100))
  ),
});

const r4BallotSubmissionSchema = z.object({
  ballot_content: r4BallotContentSchema,
  signature: z.string().regex(/^0x[a-fA-F0-9]{130}$/),
});

const r5BallotSubmissionSchema = z.object({
  ballot_content: r5BallotContentSchema,
  signature: z.string().regex(/^0x[a-fA-F0-9]{130}$/),
});

export type R4BallotSubmission = z.infer<typeof r4BallotSubmissionSchema>;
export type R5BallotSubmission = z.infer<typeof r5BallotSubmissionSchema>;

export async function POST(
  request: NextRequest,
  route: { params: { roundId: string; ballotCasterAddressOrEns: string } }
) {
  // const isBadgeholder = await fetchIsCitizen(
  //   route.params.ballotCasterAddressOrEns
  // );

  // if (!isBadgeholder) {
  //   return new Response("Only badgeholder can submit a ballot", {
  //     status: 401,
  //   });
  // }

  if (route.params.roundId === "4") {
    return new Response("Ballot submission for Round 4 is closed", {
      status: 403,
    });
  }

  return await traceWithUserId(
    route.params.ballotCasterAddressOrEns as string,
    async () => {
      const { roundId, ballotCasterAddressOrEns } = route.params;
      try {
        const payload = await request.json();

        const parsedPayload =
          roundId === "5"
            ? r5BallotSubmissionSchema.parse(payload)
            : r4BallotSubmissionSchema.parse(payload);
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
