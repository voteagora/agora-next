/*
 * TanStack Start port of src/app/api/v1/delegates/route.ts.
 *
 * The Next route remains the live handler at this URL until Phase F cutover —
 * see MIGRATION_TANSTACK_START.md.
 *
 * URL: GET /api/v1/delegates
 */

import { createFileRoute } from "@tanstack/react-router";
import { ZodError } from "zod";

import { traceWithUserId } from "@/app/api/v1/apiUtils";
import {
  createOptionalNumberValidator,
  createOptionalStringValidator,
} from "@/app/api/common/utils/validators";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

const DEFAULT_SORT = "voting_power";
const DEFAULT_MAX_LIMIT = 1500;
const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

const sortValidator = createOptionalStringValidator(
  [
    "most_delegators",
    "weighted_random",
    "voting_power",
    "least_voting_power",
    "most_recent_delegation",
    "oldest_delegation",
    "latest_voting_block",
    "vp_change_7d",
    "vp_change_7d_desc",
  ],
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

export const Route = createFileRoute("/api/v1/delegates")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request }) => {
        const { authenticateApiUser } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { fetchDelegates } = await import(
          "@/app/api/common/delegates/getDelegates"
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        return await traceWithUserId(
          authResponse.userId as string,
          async () => {
            const params = new URL(request.url).searchParams;
            try {
              const sort = sortValidator.parse(params.get("sort"));
              const limit = limitValidator.parse(params.get("limit"));
              const offset = offsetValidator.parse(params.get("offset"));
              const delegatesResult = await fetchDelegates({
                pagination: { limit, offset },
                sort,
                showParticipation: true,
              });
              return Response.json(delegatesResult);
            } catch (e: any) {
              if (e instanceof ZodError) {
                return new Response(
                  "Invalid query parameters: " + e.toString(),
                  { status: 400 }
                );
              }
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
