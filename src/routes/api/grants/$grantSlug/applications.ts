/*
 * TanStack Start port of src/app/api/grants/[grantSlug]/applications/route.ts.
 * URL: POST /api/grants/:grantSlug/applications
 */

import { createFileRoute } from "@tanstack/react-router";
import type { ZodTypeAny, ZodString } from "zod";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/grants/$grantSlug/applications")({
  server: {
    handlers: {
      POST: withApiAuth(
        async ({ request, params }) => {
          const { Prisma } = await import("@prisma/client");
          const { prismaWeb2Client } = await import("@/app/lib/prisma");
          const { default: Tenant } = await import("@/lib/tenant/tenant");
          const { z } = await import("zod");
          const { sendGrantConfirmationEmail } = await import(
            "@/lib/email/mailgun"
          );
          const { getGrant } = await import("@/app/api/common/grants/getGrant");
          const { emitBroadcastEvent } = await import(
            "@/lib/notification-center/emitter"
          );
          const { PermissionService } = await import(
            "@/server/services/permission.service"
          );
          const { authenticateApiUser } = await import(
            "@/app/lib/auth/serverAuth"
          );
          const { extractBearerTokenFromHeader } = await import(
            "@/app/lib/auth/edgeAuth"
          );
          const { verifyJwtAndGetAddress } = await import(
            "@/app/proposals/draft/actions/siweAuth"
          );

          const { grantSlug } = params;

          try {
            const authResponse = await authenticateApiUser(request as never);
            const bearerToken = extractBearerTokenFromHeader(
              request.headers.get("Authorization")
            );
            const authenticatedAddress =
              authResponse.authenticated &&
              authResponse.type === "jwt" &&
              bearerToken
                ? await verifyJwtAndGetAddress(bearerToken)
                : null;

            if (!authenticatedAddress) {
              return Response.json({ error: "Unauthorized" }, { status: 401 });
            }

            const normalizedAuthenticatedAddress =
              authenticatedAddress.toLowerCase();

            const grant = await getGrant(grantSlug);
            if (!grant || !grant.active) {
              return Response.json(
                { error: "Grant not found or not active" },
                { status: 404 }
              );
            }

            const { slug: daoSlug } = Tenant.current();

            const contentType = request.headers.get("content-type") || "";
            let payload: Record<string, unknown>;

            if (contentType.includes("application/json")) {
              payload = await request.json();
            } else {
              const form = await request.formData();
              payload = Object.fromEntries(form.entries()) as Record<
                string,
                unknown
              >;
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
            const allFields: Record<string, ZodTypeAny> = {
              applicantAddress: z.string().optional(),
            };

            if (grant.form_schema && Array.isArray(grant.form_schema)) {
              (grant.form_schema as Array<Record<string, unknown>>).forEach(
                (field) => {
                  const ftype = field.type as string;
                  const fid = field.id as string;
                  const required = field.required as boolean;
                  const validation = field.validation as
                    | Record<string, unknown>
                    | undefined;

                  if (ftype === "text" || ftype === "textarea") {
                    let schema: ZodString = z.string();
                    if (required) {
                      schema = schema.min(1, `${field.label} is required`);
                    }
                    if (validation?.minLength) {
                      schema = schema.min(
                        validation.minLength as number,
                        `Must be at least ${validation.minLength} characters`
                      );
                    }
                    if (validation?.maxLength) {
                      schema = schema.max(
                        validation.maxLength as number,
                        `Must be no more than ${validation.maxLength} characters`
                      );
                    }
                    allFields[fid] = schema;
                  } else if (ftype === "dropdown" || ftype === "radio") {
                    let schema: ZodString = z.string();
                    if (required) {
                      schema = schema.min(1, `${field.label} is required`);
                    }
                    allFields[fid] = schema;
                  } else if (ftype === "checkbox") {
                    let schema: ZodTypeAny = z.boolean();
                    if (required) {
                      schema = schema.refine(
                        (val: unknown) => val === true,
                        `${field.label} is required`
                      );
                    }
                    allFields[fid] = schema;
                  }
                }
              );
            }

            const bottomConfig = grant.bottom_text_config as
              | Record<string, unknown>
              | undefined;
            if (
              bottomConfig?.type === "confirmation" &&
              Array.isArray(bottomConfig.items)
            ) {
              (bottomConfig.items as Array<Record<string, unknown>>).forEach(
                (item) => {
                  if (item.required) {
                    allFields[`confirmation_${item.id}`] = z
                      .boolean()
                      .refine(
                        (val) => val === true,
                        `${item.text} is required`
                      );
                  } else {
                    allFields[`confirmation_${item.id}`] = z
                      .boolean()
                      .optional();
                  }
                }
              );
            }

            const dynamicSchema = z.object(allFields);
            const validatedData = dynamicSchema.parse(payload);

            if (
              validatedData.applicantAddress &&
              (validatedData.applicantAddress as string).toLowerCase() !==
                normalizedAuthenticatedAddress
            ) {
              return Response.json({ error: "Unauthorized" }, { status: 401 });
            }

            const applicationData: Record<string, unknown> = {
              applicantAddress: normalizedAuthenticatedAddress,
              ...Object.keys(validatedData)
                .filter((key) => key !== "applicantAddress")
                .reduce(
                  (acc, key) => {
                    acc[key] = validatedData[key];
                    return acc;
                  },
                  {} as Record<string, unknown>
                ),
              submittedAt: new Date().toISOString(),
            };

            // Extract email and telegram
            let email = (payload.email as string) || "";
            let telegramHandle = (payload.telegramHandle as string) || "";

            if (
              !email &&
              grant.form_schema &&
              Array.isArray(grant.form_schema)
            ) {
              const emailField = (
                grant.form_schema as Array<Record<string, unknown>>
              ).find(
                (f) =>
                  f.type === "text" &&
                  ((f.id as string)?.toLowerCase().includes("email") ||
                    (f.label as string)?.toLowerCase().includes("email"))
              );
              if (emailField && validatedData[emailField.id as string]) {
                email = validatedData[emailField.id as string] as string;
              }
            }

            if (!email) {
              for (const value of Object.values(applicationData)) {
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
              const telegramField = (
                grant.form_schema as Array<Record<string, unknown>>
              ).find(
                (f) =>
                  f.type === "text" &&
                  ((f.id as string)?.toLowerCase().includes("telegram") ||
                    (f.label as string)?.toLowerCase().includes("telegram"))
              );
              if (telegramField && validatedData[telegramField.id as string]) {
                telegramHandle = validatedData[
                  telegramField.id as string
                ] as string;
              }
            }

            const grantId = grant.id;
            const applicantAddress = normalizedAuthenticatedAddress;

            const existingApp = await prismaWeb2Client.$queryRaw<
              Array<{ id: string }>
            >(
              Prisma.sql`
                SELECT id FROM alltenant.grant_applications
                WHERE grant_id = ${grantId} AND lower(applicant_address) = ${applicantAddress}
              `
            );

            if (existingApp.length > 0) {
              return Response.json(
                { error: "You have already applied for this grant" },
                { status: 409 }
              );
            }

            const applicationResult = await prismaWeb2Client.$queryRaw<
              Array<{ id: string }>
            >(
              Prisma.sql`
                INSERT INTO alltenant.grant_applications (
                  grant_id, applicant_address, email, telegram_handle,
                  organization, data, status, signature, signed_message_digest
                ) VALUES (
                  ${grantId}, ${applicantAddress}, ${email}, ${telegramHandle},
                  ${null}, ${JSON.stringify(applicationData)}::jsonb,
                  'submitted', ${"0x"}, ${"submitted-via-ui"}
                )
                RETURNING id
              `
            );

            const applicationId = applicationResult[0].id;

            // Notify grant admins (fire and forget)
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
                  if (adminRecipients.length === 0) return;

                  let adminLinkBase =
                    process.env.AGORA_ADMIN_URL || "https://admin.agora.xyz";
                  if (!adminLinkBase.match(/^https?:\/\//i)) {
                    adminLinkBase = `https://${adminLinkBase}`;
                  }
                  const adminLink = `${adminLinkBase.replace(/\/+$/, "")}/admin/grants/applications?dao_slug=${daoSlug}`;

                  emitBroadcastEvent(
                    "grants_application_submitted",
                    applicationId,
                    { recipient_ids: adminRecipients },
                    {
                      dao_slug: daoSlug,
                      grant_slug: grant.slug,
                      grant_id: grantId,
                      application_id: applicationId,
                      admin_link: adminLink,
                    }
                  );
                } catch (notifyError) {
                  console.error(
                    "Failed to emit grant submission notification",
                    notifyError
                  );
                }
              })();
            }

            if (email && email.trim().length > 0) {
              try {
                let applicantName = (payload.name as string) || "Applicant";
                if (
                  !payload.name &&
                  grant.form_schema &&
                  Array.isArray(grant.form_schema)
                ) {
                  const nameField = (
                    grant.form_schema as Array<Record<string, unknown>>
                  ).find(
                    (f) =>
                      f.type === "text" &&
                      ((f.id as string)?.toLowerCase().includes("name") ||
                        (f.label as string)?.toLowerCase().includes("name"))
                  );
                  if (nameField && validatedData[nameField.id as string]) {
                    applicantName = validatedData[
                      nameField.id as string
                    ] as string;
                  }
                }

                const { ui } = Tenant.current();
                await sendGrantConfirmationEmail({
                  to: email,
                  data: {
                    applicant_name: applicantName,
                    grant_title: grant.title,
                    application_id: applicationId,
                    submission_date: applicationData.submittedAt as string,
                    funding_amount: grant.budget_range || "TBD",
                    applicant_email: email,
                    telegram_handle: telegramHandle,
                    support_url:
                      process.env.SUPPORT_URL || "https://support.agora.vote",
                  },
                  tenantConfig: {
                    orgName: ui.grantsEmailOrgName,
                    senderName: ui.grantsEmailSenderName,
                    followXHandle: ui.grantsFollowXHandle,
                  },
                });
              } catch (emailError) {
                console.error("Failed to send confirmation email:", emailError);
              }
            }

            return Response.json(
              {
                id: applicationId,
                message: "Application submitted successfully",
              },
              { status: 201 }
            );
          } catch (error) {
            console.error("Error submitting grant application:", error);

            const { z: zod } = await import("zod");
            if (error instanceof zod.ZodError) {
              return Response.json(
                { error: "Validation failed", details: error.errors },
                { status: 400 }
              );
            }

            return Response.json(
              { error: "Failed to submit application" },
              { status: 500 }
            );
          }
        },
        { skipAuth: true }
      ),
    },
  },
});
