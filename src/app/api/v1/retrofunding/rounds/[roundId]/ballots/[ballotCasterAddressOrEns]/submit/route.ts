import { NextRequest, NextResponse } from "next/server";

const traceWithUserId = async(
  await import("@/app/api/v1/apiUtils")
).traceWithUserId;
const submitBallot = async(
  await import("@/app/api/common/ballots/submitBallot")
).submitBallot;
const fetchBadgeholder = async(
  await import("@/app/api/common/badgeholders/getBadgeholders")
).fetchBadgeholder;
const z = (await import("zod")).default;

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
  { params }: { params: { roundId: string; ballotCasterAddressOrEns: string } }
) {
  const { authenticateApiUser, validateAddressScope } = await import(
    "@/app/lib/auth/serverAuth"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return NextResponse.json(
      { error: authResponse.failReason },
      { status: 401 }
    );
  }

  const { roundId, ballotCasterAddressOrEns } = params;

  if (roundId === "4" || roundId === "5") {
    return NextResponse.json(
      { error: "Ballot submission for Round 4 is closed" },
      { status: 403 }
    );
  }

  const scopeError = await validateAddressScope(
    ballotCasterAddressOrEns,
    authResponse
  );

  if (scopeError) {
    return NextResponse.json({ error: scopeError }, { status: 403 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const payload = await request.json();

      const VoteSchema = z.object({
        projectId: z.string(),
        amount: z.number(),
      });

      const VotesSchema = z.array(VoteSchema);
      const validatedVotes = VotesSchema.parse(payload.votes);

      const badgeholder = await fetchBadgeholder(ballotCasterAddressOrEns);
      if (!badgeholder) {
        return NextResponse.json(
          { error: "Badgeholder not found" },
          { status: 404 }
        );
      }

      if (METRICS_BASED_ROUNDS.includes(roundId)) {
        // Validate metrics-based round votes
        for (const vote of validatedVotes) {
          if (vote.amount < 0 || vote.amount > 100) {
            return NextResponse.json(
              { error: "Vote amount must be between 0 and 100" },
              { status: 400 }
            );
          }
        }
      } else if (PROJECTS_BASED_ROUNDS.includes(roundId)) {
        // Validate projects-based round votes
        const totalVotes = validatedVotes.reduce(
          (sum, vote) => sum + vote.amount,
          0
        );
        if (totalVotes !== 100) {
          return NextResponse.json(
            { error: "Total votes must sum to 100" },
            { status: 400 }
          );
        }
      }

      const ballot = await submitBallot({
        roundId,
        signature: payload.signature,
        votes: validatedVotes,
        casterAddress: badgeholder.address,
      });

      return NextResponse.json(ballot);
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return NextResponse.json({ error: e.toString() }, { status: 400 });
      }
      return NextResponse.json(
        { error: "Internal server error: " + e.toString() },
        { status: 500 }
      );
    }
  });
}
