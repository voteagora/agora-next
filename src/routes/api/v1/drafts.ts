/*
 * TanStack Start port of src/app/api/v1/drafts/route.ts.
 * URL: POST /api/v1/drafts
 */

import { createFileRoute } from "@tanstack/react-router";
import { ProposalStage } from "@prisma/client";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/v1/drafts")({
  server: {
    handlers: {
      POST: withApiAuth(
        async ({ request }) => {
          const { verifyAuth } = await import("@/lib/auth/authHelpers");
          const { prismaWeb2Client } = await import("@/lib/prisma");
          const { getMiradorTraceContextFromHeaders } = await import(
            "@/lib/mirador/requestContext"
          );
          const { appendServerTraceEvent } = await import(
            "@/lib/mirador/serverTrace"
          );
          const Tenant = (await import("@/lib/tenant/tenant")).default;

          const baseTraceContext = getMiradorTraceContextFromHeaders(
            request as never
          );

          try {
            const body = (await request.json()) as {
              creatorAddress?: string;
            } | null;
            const creatorAddress = body?.creatorAddress as
              | `0x${string}`
              | undefined;
            const traceContext = baseTraceContext
              ? {
                  ...baseTraceContext,
                  step: "proposal_draft_create",
                  source: "api" as const,
                  walletAddress: creatorAddress,
                }
              : undefined;

            appendServerTraceEvent({
              traceContext,
              eventName: "proposal_draft_create_requested",
            });

            if (!creatorAddress) {
              appendServerTraceEvent({
                traceContext,
                eventName: "proposal_draft_create_failed",
                details: { reason: "missing_creator_address" },
              });
              return Response.json(
                { message: "Missing required field: creatorAddress" },
                { status: 400 }
              );
            }

            const authz =
              request.headers.get("authorization") ||
              request.headers.get("Authorization");
            const token = authz?.startsWith("Bearer ")
              ? authz.slice(7)
              : undefined;
            const authResult = await verifyAuth(
              { jwt: token },
              creatorAddress as `0x${string}`
            );

            if (!authResult.success) {
              const reason =
                authResult.error === "Missing authentication credentials"
                  ? "missing_auth"
                  : authResult.error === "Token address mismatch"
                    ? "token_address_mismatch"
                    : authResult.error === "Invalid token"
                      ? "invalid_token"
                      : "auth_failed";
              appendServerTraceEvent({
                traceContext,
                eventName: "proposal_draft_create_failed",
                details: { reason },
              });
              return Response.json(
                { message: authResult.error },
                { status: 401 }
              );
            }

            const tenant = Tenant.current();
            const plmToggle = tenant.ui.toggle("proposal-lifecycle");
            const plmConfig = plmToggle?.config as
              | { stages?: Array<{ stage?: string }> }
              | undefined;
            if (!plmConfig?.stages?.length) {
              appendServerTraceEvent({
                traceContext,
                eventName: "proposal_draft_create_failed",
                details: { reason: "missing_proposal_lifecycle_config" },
              });
              return Response.json(
                {
                  message:
                    "Proposal lifecycle configuration not found for tenant",
                },
                { status: 400 }
              );
            }
            const firstStage = plmConfig.stages[0];
            if (!firstStage?.stage) {
              appendServerTraceEvent({
                traceContext,
                eventName: "proposal_draft_create_failed",
                details: { reason: "invalid_proposal_lifecycle_config" },
              });
              return Response.json(
                { message: "Invalid proposal lifecycle configuration" },
                { status: 500 }
              );
            }

            const proposal = await prismaWeb2Client.proposalDraft.create({
              data: {
                contract:
                  tenant.contracts.governor.address.toLowerCase() as `0x${string}`,
                chain_id: tenant.contracts.governor.chain.id,
                temp_check_link: "",
                title: "",
                abstract: "",
                audit_url: "",
                author_address: authResult.address,
                sponsor_address: "",
                stage: firstStage.stage as ProposalStage,
                dao_slug: tenant.slug,
              },
            });

            appendServerTraceEvent({
              traceContext,
              eventName: "proposal_draft_created",
              details: { draftId: proposal.uuid },
            });
            return Response.json(proposal, { status: 201 });
          } catch {
            appendServerTraceEvent({
              traceContext: baseTraceContext
                ? {
                    ...baseTraceContext,
                    step: "proposal_draft_create",
                    source: "api",
                  }
                : undefined,
              eventName: "proposal_draft_create_failed",
              details: { reason: "internal_server_error" },
            });
            return Response.json(
              { message: "Internal server error" },
              { status: 500 }
            );
          }
        },
        { skipAuth: true }
      ),
    },
  },
});
