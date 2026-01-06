export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import {
  verifySiwe,
  verifyJwtAndGetAddress,
} from "@/app/proposals/draft/actions/siweAuth";

type CreateDraftBody = {
  creatorAddress?: `0x${string}` | string;
  message?: string;
  signature?: `0x${string}` | string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateDraftBody | null;

    const creatorAddress = body?.creatorAddress as `0x${string}` | undefined;
    const message = body?.message as string | undefined;
    const signature = body?.signature as `0x${string}` | undefined;

    const authz =
      request.headers.get("authorization") ||
      request.headers.get("Authorization");
    const token = authz?.startsWith("Bearer ") ? authz.slice(7) : undefined;
    let jwtAddress: `0x${string}` | null = null;
    if (token) {
      jwtAddress = await verifyJwtAndGetAddress(token);
    }

    if (!creatorAddress) {
      return NextResponse.json(
        { message: "Missing required field: creatorAddress" },
        { status: 400 }
      );
    }

    if (!jwtAddress && (!message || !signature)) {
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
      return NextResponse.json(
        { message: "Proposal lifecycle configuration not found for tenant" },
        { status: 400 }
      );
    }
    const firstStage = (plmToggle.config as any).stages[0];
    if (!firstStage?.stage) {
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

    return NextResponse.json(proposal, { status: 201 });
  } catch (e: any) {
    // Avoid leaking internal errors
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
