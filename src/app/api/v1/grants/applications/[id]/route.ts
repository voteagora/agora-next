import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { z } from "zod";
import Tenant from "@/lib/tenant/tenant";
import type { DaoSlug } from "@prisma/client";
import { permissionService } from "@/server/services/permission.service";
import { requireWalletJwtAuth } from "@/app/lib/auth/walletJwt";

export const revalidate = 0;

const updateStatusSchema = z.object({
  status: z.enum(["submitted", "accepted", "rejected"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireWalletJwtAuth(req);
    if (!auth.ok) {
      return auth.response;
    }

    const { slug } = Tenant.current();
    const daoSlug = slug as DaoSlug;
    const hasUpdatePermission = await permissionService.checkPermission(
      { address: auth.address, daoSlug },
      { module: "grants", resource: "applications", action: "update" }
    );

    if (!hasUpdatePermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const validatedData = updateStatusSchema.parse(body);

    // Update application status within the current tenant only.
    const result = await prismaWeb2Client.$queryRaw<Array<{ id: string }>>(
      Prisma.sql`
        UPDATE alltenant.grant_applications AS ga
        SET status = ${validatedData.status}, updated_at = NOW()
        FROM alltenant.grants AS g
        WHERE ga.id = ${id}
          AND ga.grant_id = g.id
          AND g.dao_slug::text = ${slug}
        RETURNING ga.id
      `
    );

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: result[0].id,
      status: validatedData.status,
      message: "Application status updated successfully",
    });
  } catch (error) {
    console.error("Error updating application status:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}
