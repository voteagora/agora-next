"use server";

import Tenant from "@/lib/tenant/tenant";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { getIPFSUrl, uploadFileToPinata } from "@/lib/pinata";

interface AttachmentData {
  fileName: string;
  contentType: string;
  fileSize: number;
  base64Data: string;
}

export async function uploadAttachment(
  attachmentData: AttachmentData,
  address: string,
  targetType: "category" | "post",
  targetId: number
) {
  try {
    const { slug } = Tenant.current();

    const buffer = Buffer.from(attachmentData.base64Data, "base64");

    const fileBlob = new Blob([buffer], { type: attachmentData.contentType });
    const file = new File([fileBlob], attachmentData.fileName, {
      type: attachmentData.contentType,
    });

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

    let newAttachment;

    if (targetType === "post") {
      newAttachment = await prismaWeb2Client.forumPostAttachment.create({
        data: {
          dao_slug: slug,
          ipfsCid: uploadResult.IpfsHash,
          fileName: attachmentData.fileName,
          contentType: attachmentData.contentType,
          fileSize: BigInt(attachmentData.fileSize),
          address: address,
          postId: targetId,
        },
      });
    } else if (targetType === "category") {
      newAttachment = await prismaWeb2Client.forumCategoryAttachment.create({
        data: {
          dao_slug: slug,
          ipfsCid: uploadResult.IpfsHash,
          fileName: attachmentData.fileName,
          contentType: attachmentData.contentType,
          fileSize: BigInt(attachmentData.fileSize),
          address: address,
          categoryId: targetId,
        },
      });
    } else {
      throw new Error(`Invalid target type: ${targetType}`);
    }

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
