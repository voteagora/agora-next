"use server";

import type { DaoSlug } from "@prisma/client";
import { z } from "zod";
import { handlePrismaError, archiveAttachmentSchema } from "./shared";
import { getIPFSUrl, uploadFileToPinata } from "@/lib/pinata";
import verifyMessage from "@/lib/serverVerifyMessage";
import Tenant from "@/lib/tenant/tenant";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { logForumAuditAction } from "./admin";
import { checkAnyPermission, checkPermission } from "@/lib/rbac";
import { verifyAuth, type AuthParams } from "@/lib/auth/authHelpers";

const { slug } = Tenant.current();

const deleteAttachmentSchema = z.object({
  attachmentId: z.number().min(1, "Attachment ID is required"),
  targetType: z.enum(["post", "category"]),
  address: z.string().min(1, "Address is required"),
  signature: z.string().optional(),
  message: z.string().optional(),
  jwt: z.string().optional(),
});

async function verifySignedForumRequest(
  address: string,
  message: string,
  signature: string
) {
  const isValid = await verifyMessage({
    address: address as `0x${string}`,
    message,
    signature: signature as `0x${string}`,
  });

  if (!isValid) {
    return null;
  }

  return address.toLowerCase();
}

export async function getForumAttachments() {
  try {
    const now = new Date();

    const postAttachments = await prismaWeb2Client.forumPostAttachment.findMany(
      {
        where: {
          dao_slug: slug,
          archived: false,
          OR: [
            {
              revealTime: null,
              expirationTime: null,
            },
            {
              AND: [
                {
                  OR: [{ revealTime: null }, { revealTime: { lte: now } }],
                },
                {
                  OR: [
                    { expirationTime: null },
                    { expirationTime: { gt: now } },
                  ],
                },
              ],
            },
          ],
        },
        orderBy: { createdAt: "desc" },
      }
    );

    const categoryAttachments =
      await prismaWeb2Client.forumCategoryAttachment.findMany({
        where: {
          dao_slug: slug,
          archived: false,
          OR: [
            {
              revealTime: null,
              expirationTime: null,
            },
            {
              AND: [
                {
                  OR: [{ revealTime: null }, { revealTime: { lte: now } }],
                },
                {
                  OR: [
                    { expirationTime: null },
                    { expirationTime: { gt: now } },
                  ],
                },
              ],
            },
          ],
        },
        orderBy: { createdAt: "desc" },
      });

    const attachments = [...postAttachments, ...categoryAttachments];

    return {
      success: true,
      data: attachments.map((attachment: any) => ({
        id: attachment.id,
        name: attachment.fileName,
        url: getIPFSUrl(attachment.ipfsCid),
        ipfsCid: attachment.ipfsCid,
        createdAt: attachment.createdAt.toISOString(),
        uploadedBy: attachment.address,
        archived: attachment.archived,
        isFinancialStatement: attachment.isFinancialStatement ?? false,
        revealTime: attachment.revealTime?.toISOString() ?? null,
        expirationTime: attachment.expirationTime?.toISOString() ?? null,
      })),
    };
  } catch (error) {
    console.error("Error getting forum attachments:", error);
    return handlePrismaError(error);
  }
}

export async function uploadDocumentFromBase64(
  base64Data: string,
  fileName: string,
  contentType: string,
  address: string,
  categoryId: number,
  auth: AuthParams
) {
  try {
    const authResult = await verifyAuth(auth, address as `0x${string}`);
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const normalizedAddress = authResult.address.toLowerCase();

    const category = await prismaWeb2Client.forumCategory.findFirst({
      where: {
        id: categoryId,
        dao_slug: slug,
        archived: false,
      },
      select: {
        id: true,
        isDuna: true,
      },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    if (!category.isDuna) {
      return {
        success: false,
        error: "This category does not accept document uploads",
      };
    }

    const hasCreatePermission = await checkPermission(
      normalizedAddress,
      slug as DaoSlug,
      "duna_filings",
      "filings",
      "create"
    );

    if (!hasCreatePermission) {
      return { success: false, error: "Unauthorized" };
    }

    const base64Content = base64Data.includes(",")
      ? base64Data.split(",")[1]
      : base64Data;
    const buffer = Buffer.from(base64Content, "base64");

    const result = await uploadFileToPinata(buffer, {
      name: fileName,
      keyvalues: {
        type: "forum-document",
        originalName: fileName,
        contentType: contentType,
        uploadedAt: Date.now(),
      },
    });

    const document = await prismaWeb2Client.forumCategoryAttachment.create({
      data: {
        fileName,
        fileSize: buffer.length,
        contentType,
        ipfsCid: result.IpfsHash,
        address: normalizedAddress,
        dao_slug: slug,
        categoryId,
      },
    });

    return {
      success: true,
      data: {
        id: document.id,
        name: document.fileName,
        url: getIPFSUrl(document.ipfsCid),
        ipfsCid: document.ipfsCid,
        createdAt: document.createdAt.toISOString(),
        uploadedBy: normalizedAddress,
      },
    };
  } catch (error) {
    console.error("Error uploading document from base64:", error);
    return handlePrismaError(error);
  }
}

export async function deleteForumAttachment(
  data: z.infer<typeof deleteAttachmentSchema>
) {
  try {
    const validatedData = deleteAttachmentSchema.parse(data);

    const authResult = await verifyAuth(
      {
        message: validatedData.message,
        signature: validatedData.signature as `0x${string}` | undefined,
        jwt: validatedData.jwt,
      },
      validatedData.address as `0x${string}`
    );
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const normalizedAddress = authResult.address.toLowerCase();

    if (validatedData.targetType === "post") {
      const attachment = await prismaWeb2Client.forumPostAttachment.findFirst({
        where: {
          id: validatedData.attachmentId,
          dao_slug: slug,
        },
        include: {
          post: {
            select: {
              address: true,
            },
          },
        },
      });

      if (!attachment) {
        return { success: false, error: "Attachment not found" };
      }

      const isUploader =
        attachment.address?.toLowerCase() === normalizedAddress;
      const isPostAuthor =
        attachment.post.address.toLowerCase() === normalizedAddress;
      const hasDeletePermission = await checkPermission(
        normalizedAddress,
        slug as DaoSlug,
        "forums",
        "posts",
        "delete"
      );

      if (!(isUploader || isPostAuthor || hasDeletePermission)) {
        return { success: false, error: "Unauthorized" };
      }

      await prismaWeb2Client.forumPostAttachment.delete({
        where: { id: validatedData.attachmentId },
      });
      if (!(isUploader || isPostAuthor)) {
        await logForumAuditAction(
          slug,
          normalizedAddress,
          "DELETE_ATTACHMENT",
          "topic",
          validatedData.attachmentId
        );
      }
    } else if (validatedData.targetType === "category") {
      const attachment =
        await prismaWeb2Client.forumCategoryAttachment.findFirst({
          where: {
            id: validatedData.attachmentId,
            dao_slug: slug,
          },
          include: {
            category: {
              select: {
                isDuna: true,
              },
            },
          },
        });

      if (!attachment) {
        return { success: false, error: "Attachment not found" };
      }

      const isUploader =
        attachment.address?.toLowerCase() === normalizedAddress;
      const hasDeletePermission = attachment.category.isDuna
        ? await checkPermission(
            normalizedAddress,
            slug as DaoSlug,
            "duna_filings",
            "filings",
            "delete"
          )
        : false;

      if (
        !(hasDeletePermission || (!attachment.category.isDuna && isUploader))
      ) {
        return { success: false, error: "Unauthorized" };
      }

      await prismaWeb2Client.forumCategoryAttachment.delete({
        where: { id: validatedData.attachmentId },
      });

      if (!isUploader) {
        await logForumAuditAction(
          slug,
          normalizedAddress,
          "DELETE_ATTACHMENT",
          "topic",
          validatedData.attachmentId
        );
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting forum attachment:", error);
    return handlePrismaError(error);
  }
}

export async function archiveForumAttachment(
  data: z.infer<typeof archiveAttachmentSchema>
) {
  try {
    const validatedData = archiveAttachmentSchema.parse(data);

    const authResult = await verifyAuth(
      {
        message: validatedData.message,
        signature: validatedData.signature as `0x${string}` | undefined,
        jwt: validatedData.jwt,
      },
      validatedData.address as `0x${string}`
    );
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const normalizedAddress = authResult.address.toLowerCase();

    if (validatedData.targetType === "post") {
      const attachment = await prismaWeb2Client.forumPostAttachment.findFirst({
        where: {
          id: validatedData.attachmentId,
          dao_slug: slug,
        },
        include: {
          post: {
            select: {
              address: true,
            },
          },
        },
      });

      if (!attachment) {
        return { success: false, error: "Attachment not found" };
      }

      const isUploader =
        attachment.address?.toLowerCase() === normalizedAddress;
      const isPostAuthor =
        attachment.post.address.toLowerCase() === normalizedAddress;
      const hasArchivePermission = await checkAnyPermission(
        normalizedAddress,
        slug as DaoSlug,
        [
          { module: "forums", resource: "posts", action: "archive" },
          { module: "forums", resource: "posts", action: "delete" },
        ]
      );

      if (!(isUploader || isPostAuthor || hasArchivePermission)) {
        return { success: false, error: "Unauthorized" };
      }

      await prismaWeb2Client.forumPostAttachment.update({
        where: {
          id: validatedData.attachmentId,
          dao_slug: slug,
        },
        data: {
          archived: true,
        },
      });

      if (!(isUploader || isPostAuthor)) {
        await logForumAuditAction(
          slug,
          normalizedAddress,
          "ARCHIVE_ATTACHMENT",
          "topic",
          validatedData.attachmentId
        );
      }
    } else if (validatedData.targetType === "category") {
      const attachment =
        await prismaWeb2Client.forumCategoryAttachment.findFirst({
          where: {
            id: validatedData.attachmentId,
            dao_slug: slug,
          },
          include: {
            category: {
              select: {
                isDuna: true,
              },
            },
          },
        });

      if (!attachment) {
        return { success: false, error: "Attachment not found" };
      }

      const isUploader =
        attachment.address?.toLowerCase() === normalizedAddress;
      const hasArchivePermission = attachment.category.isDuna
        ? await checkAnyPermission(normalizedAddress, slug as DaoSlug, [
            {
              module: "duna_filings",
              resource: "filings",
              action: "archive",
            },
            {
              module: "duna_filings",
              resource: "filings",
              action: "delete",
            },
          ])
        : false;

      if (!(isUploader || hasArchivePermission)) {
        return { success: false, error: "Unauthorized" };
      }

      await prismaWeb2Client.forumCategoryAttachment.update({
        where: {
          id: validatedData.attachmentId,
          dao_slug: slug,
        },
        data: {
          archived: true,
        },
      });

      if (!isUploader) {
        await logForumAuditAction(
          slug,
          normalizedAddress,
          "ARCHIVE_ATTACHMENT",
          "topic",
          validatedData.attachmentId
        );
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error archiving forum attachment:", error);
    return handlePrismaError(error);
  }
}

export const getForumCategoryAttachments = async ({
  categoryId,
  archived = false,
}: {
  categoryId: number;
  archived?: boolean;
}) => {
  try {
    const now = new Date();

    const attachments = await prismaWeb2Client.forumCategoryAttachment.findMany(
      {
        where: {
          dao_slug: slug,
          categoryId,
          ...(archived
            ? {
                OR: [{ archived: true }, { expirationTime: { lte: now } }],
              }
            : {
                archived: false,
                OR: [
                  {
                    revealTime: null,
                    expirationTime: null,
                  },
                  {
                    AND: [
                      {
                        OR: [
                          { revealTime: null },
                          { revealTime: { lte: now } },
                        ],
                      },
                      {
                        OR: [
                          { expirationTime: null },
                          { expirationTime: { gt: now } },
                        ],
                      },
                    ],
                  },
                ],
              }),
        },
      }
    );

    return {
      success: true,
      data: attachments.map((attachment) => ({
        id: attachment.id,
        name: attachment.fileName,
        url: getIPFSUrl(attachment.ipfsCid),
        ipfsCid: attachment.ipfsCid,
        createdAt: attachment.createdAt.toISOString(),
        uploadedBy: attachment.address,
        archived:
          attachment.archived ||
          (attachment.expirationTime !== null &&
            attachment.expirationTime <= now),
        isFinancialStatement: attachment.isFinancialStatement ?? false,
        revealTime: attachment.revealTime?.toISOString() ?? null,
        expirationTime: attachment.expirationTime?.toISOString() ?? null,
      })),
    };
  } catch (error) {
    console.error("Error getting forum category attachments:", error);
    return handlePrismaError(error);
  }
};
