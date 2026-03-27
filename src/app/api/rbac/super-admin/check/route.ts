/**
 * Check whether the authenticated user is a super admin.
 * GET /api/rbac/super-admin/check
 */

import { type NextRequest, NextResponse } from "next/server";
import { permissionService } from "@/server/services/permission.service";
import { requireWalletJwtAuth } from "@/app/lib/auth/walletJwt";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireWalletJwtAuth(request);
    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const requestedAddress = searchParams.get("address")?.toLowerCase();

    if (requestedAddress && requestedAddress !== auth.address) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isSuperAdmin = await permissionService.isSuperAdmin(auth.address);

    return NextResponse.json({
      address: auth.address,
      isSuperAdmin,
    });
  } catch (error) {
    console.error("Failed to check super admin status:", error);

    return NextResponse.json(
      { error: "Failed to check super admin status" },
      { status: 500 }
    );
  }
}
