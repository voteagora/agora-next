export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import {
  verifySiwe,
  verifyJwtAndGetAddress,
} from "@/app/proposals/draft/actions/siweAuth";
import { appendServerTraceEvent } from "@/lib/mirador/serverTrace";
import { getMiradorTraceContextFromHeaders } from "@/lib/mirador/requestContext";

type CreateDraftBody = {
  creatorAddress?: `0x${string}` | string;
  message?: string;
  signature?: `0x${string}` | string;
};

export async function POST(request: NextRequest) {
  const baseTraceContext = getMiradorTraceContextFromHeaders(request);

  try {
    const body = (await request.json()) as CreateDraftBody | null;

    const creatorAddress = body?.creatorAddress as `0x${string}` | undefined;
    const message = body?.message as string | undefined;
    const signature = body?.signature as `0x${string}` | undefined;
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

    const authz =
      request.headers.get("authorization") ||
      request.headers.get("Authorization");
    const token = authz?.startsWith("Bearer ") ? authz.slice(7) : undefined;
    let jwtAddress: `0x${string}` | null = null;
    if (token) {
      jwtAddress = await verifyJwtAndGetAddress(token);
    }

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

    if (!jwtAddress && (!message || !signature)) {
      await appendServerTraceEvent({
        traceContext,
        eventName: "proposal_draft_create_failed",
        details: { reason: "missing_auth" },
      });
      return NextResponse.json(
        {
          message: "Missing required fields: message, signature (or valid JWT)",
        },
        { status: 400 }
      );
    }

    // Verify SIWE signature (EOA, with 1271 fallback handled by verifySiwe stack)
    if (jwtAddress) {
      if (jwtAddress.toLowerCase() !== creatorAddress.toLowerCase()) {
        await appendServerTraceEvent({
          traceContext,
          eventName: "proposal_draft_create_failed",
          details: { reason: "token_address_mismatch" },
        });
        return NextResponse.json(
          { message: "Token address mismatch" },
          { status: 401 }
        );
      }
    } else {
      const isValid = await verifySiwe({
        address: creatorAddress,
        message: message!,
        signature: signature!,
      });

      if (!isValid) {
        await appendServerTraceEvent({
          traceContext,
          eventName: "proposal_draft_create_failed",
          details: { reason: "invalid_signature" },
        });
        return NextResponse.json(
          { message: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    // Resolve tenant config and initial stage
    const tenant = Tenant.current();
    const plmToggle = tenant.ui.toggle("proposal-lifecycle");
    if (
      !plmToggle?.config ||
      !Array.isArray((plmToggle.config as any)?.stages)
    ) {
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
    const firstStage = (plmToggle.config as any).stages[0];
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

    // Create draft
    const proposal = await prismaWeb2Client.proposalDraft.create({
      data: {
        contract:
          tenant.contracts.governor.address.toLowerCase() as `0x${string}`,
        chain_id: tenant.contracts.governor.chain.id,
        temp_check_link: "",
        title: "",
        abstract: "",
        audit_url: "",
        author_address: creatorAddress,
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
