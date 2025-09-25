import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { z } from "zod";

export const revalidate = 0;

const grantApplicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  telegramHandle: z.string().min(1, "Telegram handle is required"),
  fundingAmount: z.string().min(1, "Funding amount is required"),
  projectDescription: z
    .string()
    .min(30, "Project description must be at least 30 characters"),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, "Must agree to terms"),
  agreeToPrivacy: z
    .boolean()
    .refine((val) => val === true, "Must agree to privacy policy"),
  applicantAddress: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { grantSlug: string } }
) {
  const { grantSlug } = params;
  const { slug } = Tenant.current();

  try {
    // Parse request body
    const contentType = req.headers.get("content-type") || "";
    let payload: any;

    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else {
      const form = await req.formData();
      payload = Object.fromEntries(form.entries());
      // Convert checkbox values
      payload.agreeToTerms =
        payload.agreeToTerms === "on" || payload.agreeToTerms === "true";
      payload.agreeToPrivacy =
        payload.agreeToPrivacy === "on" || payload.agreeToPrivacy === "true";
    }

    // Validate input
    const validatedData = grantApplicationSchema.parse(payload);

    // Build application data blob
    const applicationData = {
      name: validatedData.name,
      email: validatedData.email,
      telegramHandle: validatedData.telegramHandle,
      fundingAmount: validatedData.fundingAmount,
      projectDescription: validatedData.projectDescription,
      agreeToTerms: validatedData.agreeToTerms,
      agreeToPrivacy: validatedData.agreeToPrivacy,
      applicantAddress: validatedData.applicantAddress,
      submittedAt: new Date().toISOString(),
    };

    // Log DB connection info for debugging
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      try {
        const url = new URL(dbUrl);
        console.log(
          `DB Connection: ${url.hostname}:${url.port}/${url.pathname.slice(1)} (user: ${url.username})`
        );
      } catch (e) {
        console.log(`DB URL parsing failed: ${dbUrl?.substring(0, 20)}...`);
      }
    }

    // 1) Upsert grant (create if doesn't exist)
    const grantResult = await prismaWeb2Client.$queryRaw<
      Array<{ id: string }>
    >(
      Prisma.sql`
        INSERT INTO alltenant.grants (dao_slug, slug, title, description, active)
        VALUES (${slug}::config.dao_slug, ${grantSlug}, ${`Placeholder Grant: ${grantSlug}`}, ${`Auto-created placeholder for ${grantSlug}`}, TRUE)
        ON CONFLICT (dao_slug, slug)
        DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, active = EXCLUDED.active
        RETURNING id
      `
    );

    const grantId = grantResult[0].id;
    console.log(`Grant upserted with ID: ${grantId}`);

    // 2) Check for duplicate application
    const existingApp = await prismaWeb2Client.$queryRaw<
      Array<{ id: string }>
    >(
      Prisma.sql`
        SELECT id FROM alltenant.grant_applications 
        WHERE grant_id = ${grantId} AND applicant_address = ${validatedData.applicantAddress || ""}
      `
    );

    if (existingApp.length > 0) {
      return NextResponse.json(
        { error: "You have already applied for this grant" },
        { status: 409 }
      );
    }

    // 3) Insert application
    const applicationResult = await prismaWeb2Client.$queryRaw<
      Array<{ id: string }>
    >(
      Prisma.sql`
        INSERT INTO alltenant.grant_applications (
          grant_id,
          applicant_address,
          email,
          telegram_handle,
          organization,
          data,
          status,
          signature,
          signed_message_digest
        ) VALUES (
          ${grantId},
          ${validatedData.applicantAddress || ""},
          ${validatedData.email},
          ${validatedData.telegramHandle},
          ${null},
          ${JSON.stringify(applicationData)}::jsonb,
          'submitted',
          ${"0x"},
          ${"submitted-via-ui"}
        )
        RETURNING id
      `
    );

    const applicationId = applicationResult[0].id;
    console.log(`Application created with ID: ${applicationId}`);

    return NextResponse.json(
      {
        id: applicationId,
        message: "Application submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting grant application:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
