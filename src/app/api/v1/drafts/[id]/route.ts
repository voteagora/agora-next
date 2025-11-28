import { NextRequest, NextResponse } from "next/server";
import { verifyJwtAndGetAddress } from "@/app/proposals/draft/actions/siweAuth";
import { prismaWeb2Client } from "@/app/lib/web2";
import Tenant from "@/lib/tenant/tenant";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract bearer token and resolve SIWE address from JWT
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
    const siweAddress = await verifyJwtAndGetAddress(token);
    if (!siweAddress) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // UUID-only lookup for drafts
    const draft = await prismaWeb2Client.proposalDraft.findUnique({
      where: { uuid: String(params.id) },
      include: {
        transactions: true,
        social_options: true,
        checklist_items: true,
        approval_options: {
          include: { transactions: true },
        },
      },
    });

    if (!draft) {
      return NextResponse.json({ message: "Draft not found" }, { status: 404 });
    }

    // Authorization: Only owner can read draft via API (optionally allow tenant-config sharing later)
    const owner = draft.author_address?.toLowerCase();
    if (!owner || owner !== siweAddress.toLowerCase()) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Success
    return NextResponse.json(draft, { status: 200 });
  } catch (e: any) {
    console.error("GET /api/v1/drafts/[id] error", e);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
