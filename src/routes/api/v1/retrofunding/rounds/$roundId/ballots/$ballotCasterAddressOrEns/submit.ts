/*
 * TanStack Start port of src/app/api/v1/retrofunding/rounds/[roundId]/ballots/[ballotCasterAddressOrEns]/submit/route.ts.
 * URL: POST /api/v1/retrofunding/rounds/:roundId/ballots/:ballotCasterAddressOrEns/submit
 */

import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

const METRICS_BASED_ROUNDS = ["4"];

const metricsBallotContentSchema = z.object({
  allocations: z.array(z.record(z.string(), z.number())),
  os_only: z.boolean(),
  os_multiplier: z.number(),
});

const projectsBallotContentSchema = z.object({
  budget: z.number().min(1100000).max(3500000),
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

export const Route = createFileRoute(
  "/api/v1/retrofunding/rounds/$roundId/ballots/$ballotCasterAddressOrEns/submit"
)({
  server: {
    handlers: {
      POST: withApiAuth(async ({ request, params }) => {
        const { submitBallot } = await import(
          "@/app/api/common/ballots/submitBallot"
        );

        const { roundId, ballotCasterAddressOrEns } = params;

        if (roundId === "4" || roundId === "5") {
          return new Response("Ballot submission for Round 4 is closed", {
            status: 403,
          });
        }

        return traceWithUserId(ballotCasterAddressOrEns, async () => {
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
            return Response.json(ballot);
          } catch (e: unknown) {
            return new Response("Internal server error: " + String(e), {
              status: 500,
            });
          }
        });
      }),
    },
  },
});
