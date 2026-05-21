/*
 * TanStack Start port of src/app/api/v1/proposals/route.ts.
 * URL: GET /api/v1/proposals
 */

import { createFileRoute } from "@tanstack/react-router";
import { ZodError } from "zod";

import { traceWithUserId } from "@/lib/apiUtils";
import {
  createOptionalNumberValidator,
  createOptionalStringValidator,
} from "@/lib/utils/validators";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

const DEFAULT_FILTER = "relevant";
const DEFAULT_MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;
const DEFAULT_OFFSET = 0;

const filterValidator = createOptionalStringValidator(
  ["relevant", "everything"],
  DEFAULT_FILTER
);

const typeValidator = createOptionalStringValidator(
  [
    "SNAPSHOT",
    "STANDARD",
    "APPROVAL",
    "OPTIMISTIC",
    "OFFCHAIN_OPTIMISTIC",
    "OFFCHAIN_OPTIMISTIC_TIERED",
    "OFFCHAIN_STANDARD",
    "OFFCHAIN_APPROVAL",
    "OFFCHAIN",
    "EXCLUDE_ONCHAIN",
  ],
  ""
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

export const Route = createFileRoute("/api/v1/proposals/")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request }) => {
        const { authenticateApiUser } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { fetchProposals } = await import(
          "@/app/api/common/proposals/getProposals"
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
              const filter = filterValidator.parse(params.get("filter"));
              const type = typeValidator.parse(params.get("type"));
              const limit = limitValidator.parse(params.get("limit"));
              const offset = offsetValidator.parse(params.get("offset"));
              const proposalsResult = await fetchProposals({
                pagination: { limit, offset },
                filter,
                type,
              });
              return Response.json(proposalsResult);
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
