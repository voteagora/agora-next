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

// Upload to IPFS only (for temporary uploads during composition)
export async function uploadToIPFSOnly(
  attachmentData: AttachmentData,
  address: string
) {
  try {
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
        uploadedAt: Date.now(),
        uploadedBy: address,
      },
    });

    if (!uploadResult?.IpfsHash) {
      throw new Error("Pinata upload failed");
    }

    const ipfsUrl = getIPFSUrl(uploadResult.IpfsHash);

    return {
      success: true,
      ipfsUrl,
      ipfsCid: uploadResult.IpfsHash,
    };
  } catch (error) {
    console.error("IPFS upload failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

// Create attachment record after post is created
export async function createAttachmentFromIPFS(
  ipfsCid: string,
  fileName: string,
  contentType: string,
  fileSize: number,
  address: string,
  targetType: "post" | "category",
  targetId: number
) {
  try {
    const { slug } = Tenant.current();

    if (targetType === "post") {
      return await prismaWeb2Client.forumPostAttachment.create({
        data: {
          dao_slug: slug,
          ipfsCid,
          fileName,
          contentType,
          fileSize: BigInt(fileSize),
          address,
          postId: targetId,
        },
      });
    } else if (targetType === "category") {
      return await prismaWeb2Client.forumCategoryAttachment.create({
        data: {
          dao_slug: slug,
          ipfsCid,
          fileName,
          contentType,
          fileSize: BigInt(fileSize),
          address,
          categoryId: targetId,
        },
      });
    } else {
      throw new Error(`Invalid target type: ${targetType}`);
    }
  } catch (error) {
    console.error("Attachment creation failed:", error);
    throw error;
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

// Extract IPFS URLs from HTML content and create attachment records
export async function createAttachmentsFromContent(
  content: string,
  address: string,
  targetType: "post" | "category",
  targetId: number
) {
  try {
    // Extract IPFS URLs from img tags
    const ipfsUrlRegex = /https:\/\/gateway\.pinata\.cloud\/ipfs\/([a-zA-Z0-9]+)/g;
    const matches = Array.from(content.matchAll(ipfsUrlRegex));
    
    if (matches.length === 0) {
      return []; // No images to process
    }

    const attachments = [];
    
    for (const match of matches) {
      const ipfsCid = match[1];
      const ipfsUrl = match[0];
      
      // Extract filename from URL or use a default
      const fileName = `image_${ipfsCid.substring(0, 8)}.jpg`; // Default filename
      
      try {
        const attachment = await createAttachmentFromIPFS(
          ipfsCid,
          fileName,
          "image/jpeg", // Default content type
          0, // Unknown file size
          address,
          targetType,
          targetId
        );
        
        attachments.push(attachment);
      } catch (error) {
        console.error(`Failed to create attachment for ${ipfsCid}:`, error);
        // Continue with other attachments even if one fails
      }
    }
    
    return attachments;
  } catch (error) {
    console.error("Failed to create attachments from content:", error);
    throw error;
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}
