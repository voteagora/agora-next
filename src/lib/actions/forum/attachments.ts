"use server";

import { z } from "zod";
import { handlePrismaError, archiveAttachmentSchema } from "./shared";
import { uploadFileToPinata, getIPFSUrl } from "@/lib/pinata";
import verifyMessage from "@/lib/serverVerifyMessage";
import Tenant from "@/lib/tenant/tenant";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { logForumAuditAction } from "./admin";

const { slug } = Tenant.current();

const deleteAttachmentSchema = z.object({
  attachmentId: z.number().min(1, "Attachment ID is required"),
  targetType: z.enum(["post", "category"]),
  address: z.string().min(1, "Address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Signed message is required"),
  isAuthor: z.boolean().optional(),
});

export async function getForumAttachments() {
  try {
    const postAttachments = await prismaWeb2Client.forumPostAttachment.findMany(
      {
        where: {
          dao_slug: slug,
          archived: false,
        },
        orderBy: { createdAt: "desc" },
      }
    );

    const categoryAttachments =
      await prismaWeb2Client.forumCategoryAttachment.findMany({
        where: {
          dao_slug: slug,
          archived: false,
        },
        orderBy: { createdAt: "desc" },
      });

    const attachments = [...postAttachments, ...categoryAttachments];

    return {
      success: true,
      data: attachments.map((attachment: any) => ({
        id: attachment.id,
        name: attachment.fileName,
        url: getIPFSUrl(attachment.ipfsCid, "https://ipfs.io/ipfs/"),
        ipfsCid: attachment.ipfsCid,
        createdAt: attachment.createdAt.toISOString(),
        uploadedBy: attachment.address,
      })),
    };
  } catch (error) {
    console.error("Error getting forum attachments:", error);
    return handlePrismaError(error);
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

export async function uploadFileToIPFS(file: File) {
  try {
    const result = await uploadFileToPinata(file, {
      name: file.name,
      keyvalues: {
        type: "forum-document",
        originalName: file.name,
        contentType: file.type,
        uploadedAt: Date.now(),
      },
    });

    return {
      success: true,
      data: {
        ipfsCid: result.IpfsHash,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
      },
    };
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    return {
      success: false,
      error: "Failed to upload file to IPFS",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function uploadDocumentFromBase64(
  base64Data: string,
  fileName: string,
  contentType: string,
  address: string,
  signature: string,
  message: string,
  categoryId: number
) {
  try {
    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message: message,
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    // Convert base64 to buffer
    const base64Content = base64Data.split(",")[1];
    const buffer = Buffer.from(base64Content, "base64");

    // Upload to IPFS
    const result = await uploadFileToPinata(buffer, {
      name: fileName,
      keyvalues: {
        type: "forum-document",
        originalName: fileName,
        contentType: contentType,
        uploadedAt: Date.now(),
      },
    });

    // Save to database
    const document = await prismaWeb2Client.forumCategoryAttachment.create({
      data: {
        fileName: fileName,
        fileSize: buffer.length,
        contentType: contentType,
        ipfsCid: result.IpfsHash,
        address: address,
        dao_slug: slug,
        categoryId: categoryId,
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
        uploadedBy: address,
      },
    };
  } catch (error) {
    console.error("Error uploading document from base64:", error);
    return handlePrismaError(error);
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

export async function deleteForumAttachment(
  data: z.infer<typeof deleteAttachmentSchema>
) {
  try {
    const validatedData = deleteAttachmentSchema.parse(data);

    const isValid = await verifyMessage({
      address: validatedData.address as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    if (validatedData.targetType === "post") {
      await prismaWeb2Client.forumPostAttachment.delete({
        where: { id: validatedData.attachmentId },
      });
    } else if (validatedData.targetType === "category") {
      await prismaWeb2Client.forumCategoryAttachment.delete({
        where: { id: validatedData.attachmentId },
      });
    }

    if (!validatedData.isAuthor) {
      await logForumAuditAction(
        slug,
        validatedData.address,
        "DELETE_ATTACHMENT",
        "topic",
        validatedData.attachmentId
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting forum attachment:", error);
    return handlePrismaError(error);
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

export async function archiveForumAttachment(
  data: z.infer<typeof archiveAttachmentSchema>
) {
  try {
    const validatedData = archiveAttachmentSchema.parse(data);

    const isValid = await verifyMessage({
      address: validatedData.address as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    if (validatedData.targetType === "post") {
      await prismaWeb2Client.forumPostAttachment.update({
        where: {
          id: validatedData.attachmentId,
          dao_slug: slug,
        },
        data: {
          archived: true,
        },
      });
    } else if (validatedData.targetType === "category") {
      await prismaWeb2Client.forumCategoryAttachment.update({
        where: {
          id: validatedData.attachmentId,
          dao_slug: slug,
        },
        data: {
          archived: true,
        },
      });
    }

    if (!validatedData.isAuthor) {
      await logForumAuditAction(
        slug,
        validatedData.address,
        "ARCHIVE_ATTACHMENT",
        "topic",
        validatedData.attachmentId
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error archiving forum attachment:", error);
    return handlePrismaError(error);
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

export const getForumCategoryAttachments = async ({
  categoryId,
}: {
  categoryId: number;
}) => {
  try {
    const attachments = await prismaWeb2Client.forumCategoryAttachment.findMany(
      {
        where: {
          dao_slug: slug,
          categoryId,
        },
      }
    );

    return {
      success: true,
      data: attachments.map((attachment) => ({
        id: attachment.id,
        name: attachment.fileName,
        url: getIPFSUrl(attachment.ipfsCid, "https://ipfs.io/ipfs/"),
        ipfsCid: attachment.ipfsCid,
        createdAt: attachment.createdAt.toISOString(),
        uploadedBy: attachment.address,
      })),
    };
  } catch (error) {
    console.error("Error getting forum category attachments:", error);
    return handlePrismaError(error);
  } finally {
    await prismaWeb2Client.$disconnect();
  }
};
