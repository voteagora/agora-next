export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { appendServerTraceEvent } from "@/lib/mirador/serverTrace";
import { getMiradorTraceContextFromHeaders } from "@/lib/mirador/requestContext";
import { verifyAuth } from "@/lib/auth/authHelpers";
import { PLMConfig } from "@/app/proposals/draft/types";

type CreateDraftBody = {
  creatorAddress?: `0x${string}` | string;
};

export async function POST(request: NextRequest) {
  const baseTraceContext = getMiradorTraceContextFromHeaders(request);

  try {
    const body = (await request.json()) as CreateDraftBody | null;

    const creatorAddress = body?.creatorAddress as `0x${string}` | undefined;
    const traceContext = baseTraceContext
      ? {
          ...baseTraceContext,
          step: "proposal_draft_create",
          source: "api" as const,
          walletAddress: creatorAddress,
        }
      : undefined;

    await appendServerTraceEvent({
      traceContext,
      eventName: "proposal_draft_create_requested",
    });

    if (!creatorAddress) {
      await appendServerTraceEvent({
        traceContext,
        eventName: "proposal_draft_create_failed",
        details: { reason: "missing_creator_address" },
      });
      return NextResponse.json(
        { message: "Missing required field: creatorAddress" },
        { status: 400 }
      );
    }

    const authz =
      request.headers.get("authorization") ||
      request.headers.get("Authorization");
    const token = authz?.startsWith("Bearer ") ? authz.slice(7) : undefined;
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

      await appendServerTraceEvent({
        traceContext,
        eventName: "proposal_draft_create_failed",
        details: { reason },
      });

      return NextResponse.json({ message: authResult.error }, { status: 401 });
    }

    const tenant = Tenant.current();
    const plmToggle = tenant.ui.toggle("proposal-lifecycle");
    const plmConfig = plmToggle?.config as PLMConfig | undefined;
    if (!plmConfig?.stages?.length) {
      await appendServerTraceEvent({
        traceContext,
        eventName: "proposal_draft_create_failed",
        details: { reason: "missing_proposal_lifecycle_config" },
      });
      return NextResponse.json(
        { message: "Proposal lifecycle configuration not found for tenant" },
        { status: 400 }
      );
    }
    const firstStage = plmConfig.stages[0];
    if (!firstStage?.stage) {
      await appendServerTraceEvent({
        traceContext,
        eventName: "proposal_draft_create_failed",
        details: { reason: "invalid_proposal_lifecycle_config" },
      });
      return NextResponse.json(
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
        stage: firstStage.stage,
        dao_slug: tenant.slug,
      },
    });

    await appendServerTraceEvent({
      traceContext,
      eventName: "proposal_draft_created",
      details: { draftId: proposal.uuid },
    });
    return NextResponse.json(proposal, { status: 201 });
  } catch (e: any) {
    // Avoid leaking internal errors
    await appendServerTraceEvent({
      traceContext: baseTraceContext
        ? { ...baseTraceContext, step: "proposal_draft_create", source: "api" }
        : undefined,
      eventName: "proposal_draft_create_failed",
      details: { reason: "internal_server_error" },
    });
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
