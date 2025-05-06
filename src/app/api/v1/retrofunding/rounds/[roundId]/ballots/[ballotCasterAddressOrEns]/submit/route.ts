import { NextResponse, type NextRequest } from "next/server";
import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { submitBallot } from "@/app/api/common/ballots/submitBallot";
import { z } from "zod";
import { fetchBadgeholder } from "@/app/api/common/badgeholders/getBadgeholders";

const METRICS_BASED_ROUNDS = ["4"];
const PROJECTS_BASED_ROUNDS = ["5", "6"];

const metricsBallotContentSchema = z.object({
  allocations: z.array(z.record(z.string(), z.number())),
  os_only: z.boolean(),
  os_multiplier: z.number(),
});

const projectsBallotContentSchema = z.object({
  budget: z.number().min(1100000).max(3500000), // number between 1.1M and 3.5M
  project_allocations: z.array(
    z.record(z.string(), z.string(z.number().min(0).max(100)).nullable())
  ),
  category_allocations: z.array(
    z.record(z.string(), z.string(z.number().min(0).max(100)))
  ),
});

const metricsBallotSubmissionSchema = z.object({
  ballot_content: metricsBallotContentSchema,
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
});

const projectsBallotSubmissionSchema = z.object({
  ballot_content: projectsBallotContentSchema,
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
});

export type MetricsBallotSubmission = z.infer<
  typeof metricsBallotSubmissionSchema
>;
export type ProjectsBallotSubmission = z.infer<
  typeof projectsBallotSubmissionSchema
>;

export async function POST(
  request: NextRequest,
  route: { params: { roundId: string; ballotCasterAddressOrEns: string } }
) {
  if (route.params.roundId === "4" || route.params.roundId === "5") {
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

        const parsedPayload = METRICS_BASED_ROUNDS.includes(roundId)
          ? metricsBallotSubmissionSchema.parse(payload)
          : projectsBallotSubmissionSchema.parse(payload);
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
