import { NextRequest, NextResponse } from "next/server";
import { verifyJwtAndGetAddress } from "@/app/proposals/draft/actions/siweAuth";
import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { PLMConfig } from "@/app/proposals/draft/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenant = Tenant.current();
    const plmToggle = tenant.ui.toggle("proposal-lifecycle");
    const config = plmToggle?.config as PLMConfig;

    const shareParam = request.nextUrl.searchParams.get("share");
    const isShareRequest = Boolean(config?.allowDraftSharing && shareParam);

    let siweAddress: string | null = null;

    if (!isShareRequest) {
      const authz =
        request.headers.get("authorization") ||
        request.headers.get("Authorization");
      const token = authz?.startsWith("Bearer ") ? authz.slice(7) : undefined;
      if (!token) {
        return NextResponse.json(
          { message: "Missing bearer token" },
          { status: 401 }
        );
      }
      siweAddress = await verifyJwtAndGetAddress(token);
      if (!siweAddress) {
        return NextResponse.json(
          { message: "Invalid or expired token" },
          { status: 401 }
        );
      }
    }

    const draft = await prismaWeb2Client.proposalDraft.findUnique({
      where: { uuid: String(params.id) },
      include: {
        transactions: {
          orderBy: { order: "asc" },
        },
        social_options: true,
        checklist_items: true,
        approval_options: {
          include: {
            transactions: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!draft) {
      return NextResponse.json({ message: "Draft not found" }, { status: 404 });
    }

    const owner = draft.author_address?.toLowerCase();

    if (isShareRequest) {
      if (owner === shareParam?.toLowerCase()) {
        return NextResponse.json(draft, { status: 200 });
      }
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const addressLower = siweAddress?.toLowerCase();
    let isAuthorized = owner === addressLower;

    if (!isAuthorized) {
      const offchainCreators = config?.offchainProposalCreator || [];
      isAuthorized = offchainCreators.some(
        (creator) => creator.toLowerCase() === addressLower
      );
    }

    if (!owner || !isAuthorized) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(draft, { status: 200 });
  } catch (e: any) {
    console.error("GET /api/v1/drafts/[id] error", e);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
