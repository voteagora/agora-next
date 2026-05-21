/*
 * TanStack Start port of src/app/api/v1/drafts/[id]/route.ts.
 * URL: GET /api/v1/drafts/:id
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/v1/drafts/$id")({
  server: {
    handlers: {
      GET: withApiAuth(
        async ({ request, params }) => {
          const { verifyJwtAndGetAddress } = await import(
            "@/app/proposals/draft/actions/siweAuth"
          );
          const { prismaWeb2Client } = await import("@/lib/prisma");
          const Tenant = (await import("@/lib/tenant/tenant")).default;

          try {
            const tenant = Tenant.current();
            const plmToggle = tenant.ui.toggle("proposal-lifecycle");
            const config = plmToggle?.config as
              | {
                  allowDraftSharing?: boolean;
                  offchainProposalCreator?: string[];
                }
              | undefined;

            const url = new URL(request.url);
            const shareParam = url.searchParams.get("share");
            const isShareRequest = Boolean(
              config?.allowDraftSharing && shareParam
            );

            let siweAddress: string | null = null;

            if (!isShareRequest) {
              const authz =
                request.headers.get("authorization") ||
                request.headers.get("Authorization");
              const token = authz?.startsWith("Bearer ")
                ? authz.slice(7)
                : undefined;
              if (!token) {
                return Response.json(
                  { message: "Missing bearer token" },
                  { status: 401 }
                );
              }
              siweAddress = await verifyJwtAndGetAddress(token);
              if (!siweAddress) {
                return Response.json(
                  { message: "Invalid or expired token" },
                  { status: 401 }
                );
              }
            }

            const draft = await prismaWeb2Client.proposalDraft.findUnique({
              where: { uuid: String(params.id) },
              include: {
                transactions: { orderBy: { order: "asc" } },
                social_options: true,
                checklist_items: true,
                approval_options: {
                  include: {
                    transactions: { orderBy: { order: "asc" } },
                  },
                },
              },
            });

            if (!draft) {
              return Response.json(
                { message: "Draft not found" },
                { status: 404 }
              );
            }

            const owner = draft.author_address?.toLowerCase();

            if (isShareRequest) {
              if (owner === shareParam?.toLowerCase()) {
                return Response.json(draft, { status: 200 });
              }
              return Response.json({ message: "Forbidden" }, { status: 403 });
            }

            const addressLower = siweAddress?.toLowerCase();
            let isAuthorized = owner === addressLower;

            if (!isAuthorized) {
              const offchainCreators = config?.offchainProposalCreator ?? [];
              isAuthorized = offchainCreators.some(
                (creator) => creator.toLowerCase() === addressLower
              );
            }

            if (!owner || !isAuthorized) {
              return Response.json({ message: "Forbidden" }, { status: 403 });
            }

            return Response.json(draft, { status: 200 });
          } catch (e: unknown) {
            console.error("GET /api/v1/drafts/$id error", e);
            return Response.json(
              { message: "Internal server error" },
              { status: 500 }
            );
          }
        },
        { skipAuth: true, allowDraftShare: true }
      ),
    },
  },
});
