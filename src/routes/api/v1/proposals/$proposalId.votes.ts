/*
 * TanStack Start port of src/app/api/v1/proposals/[proposalId]/votes/route.ts.
 * URL: GET /api/v1/proposals/:proposalId/votes
 */

import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/app/api/v1/apiUtils";
import {
  createOptionalNumberValidator,
  createOptionalStringValidator,
} from "@/app/api/common/utils/validators";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

const DEFAULT_SORT = "weight";
const DEFAULT_MAX_LIMIT = 1000;
const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

const sortValidator = createOptionalStringValidator(
  ["weight", "block_number"],
  DEFAULT_SORT
);
const limitValidator = createOptionalNumberValidator(
  1,
  DEFAULT_MAX_LIMIT,
  DEFAULT_LIMIT
);
const offsetValidator = createOptionalNumberValidator(
  0,
  Number.MAX_SAFE_INTEGER,
  DEFAULT_OFFSET
);

export const Route = createFileRoute("/api/v1/proposals/$proposalId/votes")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { fetchVotesForProposal } = await import(
          "@/app/api/common/votes/getVotes"
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        return await traceWithUserId(
          authResponse.userId as string,
          async () => {
            const searchParams = new URL(request.url).searchParams;
            try {
              const { proposalId } = params as { proposalId: string };
              const sort = sortValidator.parse(searchParams.get("sort"));
              const limit = limitValidator.parse(searchParams.get("limit"));
              const offset = offsetValidator.parse(searchParams.get("offset"));
              const votes = await fetchVotesForProposal({
                proposalId,
                pagination: { limit, offset },
                sort,
              });
              return Response.json(votes);
            } catch (e: any) {
              return new Response("Internal server error: " + e.toString(), {
                status: 500,
              });
            }
          }
        );
      }),
    },
  },
});
