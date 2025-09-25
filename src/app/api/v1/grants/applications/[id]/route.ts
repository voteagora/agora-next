import { NextRequest, NextResponse } from "next/server";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { z } from "zod";

export const revalidate = 0;

const updateStatusSchema = z.object({
  status: z.enum(["submitted", "accepted", "rejected"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Simple auth check - in production, use proper admin auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const validatedData = updateStatusSchema.parse(body);

    // Update application status
    const result = await prismaWeb2Client.$queryRawUnsafe<
      Array<{ id: string }>
    >(
      `UPDATE alltenant.grant_applications 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id`,
      validatedData.status,
      id
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
