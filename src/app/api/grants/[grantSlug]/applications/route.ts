import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { z } from "zod";
import { sendGrantConfirmationEmail } from "@/lib/email/mailgun";
import { getGrant } from "@/app/api/common/grants/getGrant";
import { emitDirectEvent } from "@/lib/notification-center/emitter";
import { PermissionService } from "@/server/services/permission.service";

export const revalidate = 0;

// Build dynamic schema based on grant's form_schema
function buildDynamicSchema(grant: any) {
  const allFields: Record<string, z.ZodTypeAny> = {
    applicantAddress: z.string().optional(),
  };

  // Add dynamic fields from form_schema
  if (grant.form_schema && Array.isArray(grant.form_schema)) {
    grant.form_schema.forEach((field: any) => {
      switch (field.type) {
        case "text":
          let textSchema:
            | z.ZodString
            | z.ZodEffects<z.ZodString, string, string> = z.string();
          if (field.required) {
            textSchema = textSchema.min(1, `${field.label} is required`);
            if (field.validation?.minLength) {
              textSchema = textSchema.min(
                field.validation.minLength,
                `Must be at least ${field.validation.minLength} characters`
              );
            }
            if (field.validation?.maxLength) {
              textSchema = textSchema.max(
                field.validation.maxLength,
                `Must be no more than ${field.validation.maxLength} characters`
              );
            }
            if (field.validation?.pattern) {
              textSchema = textSchema.regex(
                new RegExp(field.validation.pattern),
                "Invalid format"
              );
            }
          } else if (
            field.validation?.minLength ||
            field.validation?.maxLength ||
            field.validation?.pattern
          ) {
            // For optional fields, only validate when value is not empty
            textSchema = textSchema.refine(
              (val) =>
                val === "" ||
                ((!field.validation?.minLength ||
                  val.length >= field.validation.minLength) &&
                  (!field.validation?.maxLength ||
                    val.length <= field.validation.maxLength) &&
                  (!field.validation?.pattern ||
                    new RegExp(field.validation.pattern).test(val))),
              (val) => {
                if (val === "") return { message: "" };
                if (
                  field.validation?.minLength &&
                  val.length < field.validation.minLength
                ) {
                  return {
                    message: `Must be at least ${field.validation.minLength} characters`,
                  };
                }
                if (
                  field.validation?.maxLength &&
                  val.length > field.validation.maxLength
                ) {
                  return {
                    message: `Must be no more than ${field.validation.maxLength} characters`,
                  };
                }
                if (
                  field.validation?.pattern &&
                  !new RegExp(field.validation.pattern).test(val)
                ) {
                  return { message: "Invalid format" };
                }
                return { message: "" };
              }
            );
          }
          allFields[field.id] = textSchema;
          break;
        case "textarea":
          let textareaSchema:
            | z.ZodString
            | z.ZodEffects<z.ZodString, string, string> = z.string();
          if (field.required) {
            textareaSchema = textareaSchema.min(
              1,
              `${field.label} is required`
            );
            if (field.validation?.minLength) {
              textareaSchema = textareaSchema.min(
                field.validation.minLength,
                `Must be at least ${field.validation.minLength} characters`
              );
            }
            if (field.validation?.maxLength) {
              textareaSchema = textareaSchema.max(
                field.validation.maxLength,
                `Must be no more than ${field.validation.maxLength} characters`
              );
            }
          } else if (
            field.validation?.minLength ||
            field.validation?.maxLength
          ) {
            // For optional fields, only validate when value is not empty
            textareaSchema = textareaSchema.refine(
              (val) =>
                val === "" ||
                ((!field.validation?.minLength ||
                  val.length >= field.validation.minLength) &&
                  (!field.validation?.maxLength ||
                    val.length <= field.validation.maxLength)),
              (val) => {
                if (val === "") return { message: "" };
                if (
                  field.validation?.minLength &&
                  val.length < field.validation.minLength
                ) {
                  return {
                    message: `Must be at least ${field.validation.minLength} characters`,
                  };
                }
                if (
                  field.validation?.maxLength &&
                  val.length > field.validation.maxLength
                ) {
                  return {
                    message: `Must be no more than ${field.validation.maxLength} characters`,
                  };
                }
                return { message: "" };
              }
            );
          }
          allFields[field.id] = textareaSchema;
          break;
        case "dropdown":
        case "radio":
          let selectSchema: z.ZodString = z.string();
          if (field.required) {
            selectSchema = selectSchema.min(1, `${field.label} is required`);
          }
          allFields[field.id] = selectSchema;
          break;
        case "checkbox":
          let checkboxSchema: z.ZodTypeAny = z.boolean();
          if (field.required) {
            checkboxSchema = checkboxSchema.refine(
              (val) => val === true,
              `${field.label} is required`
            );
          }
          allFields[field.id] = checkboxSchema;
          break;
      }
    });
  }

  // Add confirmation checkboxes from bottom_text_config
  if (
    grant.bottom_text_config?.type === "confirmation" &&
    grant.bottom_text_config.items
  ) {
    grant.bottom_text_config.items.forEach((item: any) => {
      if (item.required) {
        allFields[`confirmation_${item.id}`] = z
          .boolean()
          .refine((val) => val === true, `${item.text} is required`);
      } else {
        allFields[`confirmation_${item.id}`] = z.boolean().optional();
      }
    });
  }

  return z.object(allFields);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { grantSlug: string } }
) {
  const { grantSlug } = params;

  try {
    // First, verify the grant exists
    const grant = await getGrant(grantSlug);
    if (!grant || !grant.active) {
      return NextResponse.json(
        { error: "Grant not found or not active" },
        { status: 404 }
      );
    }

    const { slug: daoSlug } = Tenant.current();

    // Parse request body
    const contentType = req.headers.get("content-type") || "";
    let payload: any;

    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else {
      const form = await req.formData();
      payload = Object.fromEntries(form.entries());
      // Convert checkbox values to booleans
      Object.keys(payload).forEach((key) => {
        if (typeof payload[key] === "string") {
          if (payload[key] === "on" || payload[key] === "true") {
            payload[key] = true;
          } else if (payload[key] === "false") {
            payload[key] = false;
          }
        }
      });
    }

    // Build dynamic schema based on grant's form_schema
    const dynamicSchema = buildDynamicSchema(grant);

    // Validate input
    const validatedData = dynamicSchema.parse(payload);

    // Build application data blob - include all form fields dynamically
    const applicationData = {
      applicantAddress: validatedData.applicantAddress || "",
      // Include all dynamic form fields
      ...Object.keys(validatedData)
        .filter((key) => key !== "applicantAddress")
        .reduce(
          (acc, key) => {
            acc[key] = validatedData[key];
            return acc;
          },
          {} as Record<string, any>
        ),
      submittedAt: new Date().toISOString(),
    };

    // Extract email and telegram from form data
    // First check for common field names, then look in form_schema
    let email = payload.email || "";
    let telegramHandle = payload.telegramHandle || "";

    // If not found, try to find email/telegram fields in form_schema
    if (!email && grant.form_schema && Array.isArray(grant.form_schema)) {
      // Look for fields with email-related labels or IDs
      const emailField = grant.form_schema.find(
        (field: any) =>
          field.type === "text" &&
          (field.id?.toLowerCase().includes("email") ||
            field.label?.toLowerCase().includes("email"))
      );

      if (emailField) {
        // Try to get email from validatedData
        if (validatedData[emailField.id]) {
          email = validatedData[emailField.id];
        } else if (payload[emailField.id]) {
          // Fallback to payload if not in validatedData
          email = payload[emailField.id];
        }
      }

      // If still not found, check all text fields for email-like values
      if (!email) {
        for (const field of grant.form_schema) {
          if (field.type === "text" && validatedData[field.id]) {
            const value = validatedData[field.id];
            // Check if value looks like an email
            if (
              typeof value === "string" &&
              value.includes("@") &&
              value.includes(".")
            ) {
              email = value;
              break;
            }
          }
        }
      }
    }

    // Final fallback: check applicationData for any email-like values
    if (!email || email.trim().length === 0) {
      for (const [key, value] of Object.entries(applicationData)) {
        if (
          typeof value === "string" &&
          value.includes("@") &&
          value.includes(".") &&
          value.length > 5
        ) {
          email = value;
          break;
        }
      }
    }

    if (
      !telegramHandle &&
      grant.form_schema &&
      Array.isArray(grant.form_schema)
    ) {
      // Look for fields with telegram-related labels or IDs
      const telegramField = grant.form_schema.find(
        (field: any) =>
          field.type === "text" &&
          (field.id?.toLowerCase().includes("telegram") ||
            field.label?.toLowerCase().includes("telegram"))
      );
      if (telegramField && validatedData[telegramField.id]) {
        telegramHandle = validatedData[telegramField.id];
      }
    }

    const grantId = grant.id;

    // 2) Check for duplicate application
    const applicantAddress = validatedData.applicantAddress || "";
    const existingApp = await prismaWeb2Client.$queryRaw<Array<{ id: string }>>(
      Prisma.sql`
        SELECT id FROM alltenant.grant_applications 
        WHERE grant_id = ${grantId} AND applicant_address = ${applicantAddress}
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
          ${applicantAddress},
          ${email},
          ${telegramHandle},
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

    // Notify grant admins about the new application (fire and forget)
    {
      const permissionService = new PermissionService();
      void (async () => {
        try {
          const adminRecipients =
            await permissionService.getAddressesWithPermission(
              "grants",
              "applications",
              "read",
              daoSlug
            );

          if (adminRecipients.length === 0) {
            console.log("No grant admins found to notify");
            return;
          }

          const adminLinkBase = process.env.AGORA_ADMIN_URL;
          const adminLinkPath = `/admin/grants/applications?dao_slug=${daoSlug}`;
          const adminLink = adminLinkBase
            ? `${adminLinkBase}${adminLinkPath}`
            : adminLinkPath;

          const notificationData = {
            dao_slug: daoSlug,
            grant_slug: grant.slug,
            grant_id: grantId,
            application_id: applicationId,
            admin_link: adminLink,
          };

          for (const recipient of adminRecipients) {
            emitDirectEvent(
              "grants_application_submitted",
              recipient,
              applicationId,
              notificationData
            );
          }
        } catch (notifyError) {
          console.error(
            "Failed to emit grant submission notification",
            notifyError
          );
        }
      })();
    }

    // Send confirmation email (don't block the response if email fails)
    // Only send if email field exists in the form and is not empty
    if (email && email.trim().length > 0) {
      try {
        // Try to find name field from form_schema if not in payload
        let applicantName = payload.name || "Applicant";
        if (
          !payload.name &&
          grant.form_schema &&
          Array.isArray(grant.form_schema)
        ) {
          const nameField = grant.form_schema.find(
            (field: any) =>
              field.type === "text" &&
              (field.id?.toLowerCase().includes("name") ||
                field.label?.toLowerCase().includes("name"))
          );
          if (nameField && validatedData[nameField.id]) {
            applicantName = validatedData[nameField.id];
          }
        }

        await sendGrantConfirmationEmail({
          to: email,
          data: {
            applicant_name: applicantName,
            grant_title: grant.title,
            application_id: applicationId,
            submission_date: applicationData.submittedAt,
            funding_amount: grant.budget_range || "TBD",
            applicant_email: email,
            telegram_handle: telegramHandle,
            support_url:
              process.env.SUPPORT_URL || "https://support.agora.vote",
          },
        });
      } catch (emailError) {
        // Log email error but don't fail the application submission
        console.error("Failed to send confirmation email:", emailError);
      }
    }

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
