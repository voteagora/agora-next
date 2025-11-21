/**
 * Get current user's permissions for a DAO
 * GET /api/rbac/permissions/me?daoSlug=optimism&address=0x...
 */

import { type NextRequest, NextResponse } from "next/server";
import { permissionService } from "@/server/services/permission.service";
import type { DaoSlug } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daoSlug = searchParams.get("daoSlug") as DaoSlug | null;
    const address = searchParams.get("address");

    if (!daoSlug) {
      return NextResponse.json(
        { error: "daoSlug is required" },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        { error: "address is required" },
        { status: 400 }
      );
    }

    const permissions = await permissionService.getUserPermissions(
      address,
      daoSlug
    );

    return NextResponse.json({
      address: address.toLowerCase(),
      daoSlug,
      permissions,
    });
  } catch (error) {
    console.error("Failed to fetch user permissions:", error);

    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}
