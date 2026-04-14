/**
 * Get the authenticated user's permissions for a DAO.
 * GET /api/rbac/permissions/me?daoSlug=optimism
 */

import { type NextRequest, NextResponse } from "next/server";
import { permissionService } from "@/server/services/permission.service";
import type { DaoSlug } from "@prisma/client";
import { requireWalletJwtAuth } from "@/app/lib/auth/walletJwt";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireWalletJwtAuth(request);
    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const daoSlug = searchParams.get("daoSlug") as DaoSlug | null;
    const requestedAddress = searchParams.get("address")?.toLowerCase();

    if (!daoSlug) {
      return NextResponse.json(
        { error: "daoSlug is required" },
        { status: 400 }
      );
    }

    if (requestedAddress && requestedAddress !== auth.address) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const permissions = await permissionService.getUserPermissions(
      auth.address,
      daoSlug
    );

    return NextResponse.json({
      address: auth.address,
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
