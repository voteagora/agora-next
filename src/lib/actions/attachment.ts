"use server";

import { AttachableType } from "@prisma/client";
import Tenant from "@/lib/tenant/tenant";
import { prismaWeb2Client } from "@/app/lib/prisma";

interface AttachmentData {
  fileName: string;
  contentType: string;
  fileSize: number;
  base64Data: string;
}

export async function uploadAttachment(
  attachmentData: AttachmentData,
  address: string,
  targetType: "topic" | "post",
  targetId: number
) {
  try {
    const { slug } = Tenant.current();

    const buffer = Buffer.from(attachmentData.base64Data, "base64");

    const fileBlob = new Blob([buffer], { type: attachmentData.contentType });
    const file = new File([fileBlob], attachmentData.fileName, {
      type: attachmentData.contentType,
    });

    const { uploadFileToPinata, getIPFSUrl } = await import("@/lib/pinata");

    const uploadResult = await uploadFileToPinata(file, {
      name: attachmentData.fileName,
      keyvalues: {
        type: "forum-attachment",
        originalName: attachmentData.fileName,
        contentType: attachmentData.contentType,
        targetType,
        targetId: targetId.toString(),
        uploadedAt: Date.now(),
      },
    });

    if (!uploadResult?.IpfsHash) {
      throw new Error("Pinata upload failed");
    }

    const newAttachment = await prismaWeb2Client.forumAttachment.create({
      data: {
        dao_slug: slug,
        ipfsCid: uploadResult.IpfsHash,
        fileName: attachmentData.fileName,
        contentType: attachmentData.contentType,
        fileSize: BigInt(attachmentData.fileSize),
        address: address,
        targetType:
          targetType === "topic" ? AttachableType.topic : AttachableType.post,
        targetId: targetId,
      },
    });

    const ipfsUrl = getIPFSUrl(uploadResult.IpfsHash);

    return {
      success: true,
      attachment: {
        id: newAttachment.id,
        ipfsCid: newAttachment.ipfsCid,
        fileName: newAttachment.fileName,
        contentType: newAttachment.contentType,
        fileSize: Number(newAttachment.fileSize),
        createdAt: newAttachment.createdAt.toISOString(),
        ipfsUrl,
      },
    };
  } catch (error) {
    console.error("Upload failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}
