/**
 * Check if user is a super admin
 * GET /api/rbac/super-admin/check?address=0x...
 */

import { type NextRequest, NextResponse } from "next/server";
import { permissionService } from "@/server/services/permission.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "address is required" },
        { status: 400 }
      );
    }

    const isSuperAdmin = await permissionService.isSuperAdmin(address);

    return NextResponse.json({
      address: address.toLowerCase(),
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
