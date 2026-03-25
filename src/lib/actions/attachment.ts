"use server";

import Tenant from "@/lib/tenant/tenant";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { getIPFSUrl, uploadFileToPinata } from "@/lib/pinata";
import { verifyAuth, type AuthParams } from "@/lib/auth/authHelpers";
import {
  ALLOWED_FORUM_ATTACHMENT_CONTENT_TYPES,
  ALLOWED_INLINE_IMAGE_CONTENT_TYPES,
  decodeBase64Upload,
  validateUploadBuffer,
  validateUploadRateLimit,
} from "@/lib/uploadValidation";

interface AttachmentData {
  fileName: string;
  contentType: string;
  fileSize: number;
  base64Data: string;
}

async function assertCanAttachToPost(postId: number, address: string) {
  const { slug } = Tenant.current();
  const post = await prismaWeb2Client.forumPost.findFirst({
    where: {
      id: postId,
      dao_slug: slug,
    },
    select: {
      id: true,
      address: true,
    },
  });

  if (!post) {
    return { ok: false as const, error: "Post not found" };
  }

  if (post.address.toLowerCase() !== address.toLowerCase()) {
    return { ok: false as const, error: "Unauthorized" };
  }

  return { ok: true as const };
}

export async function uploadAttachment(
  attachmentData: AttachmentData,
  address: string,
  targetType: "category" | "post",
  targetId: number,
  auth: AuthParams
) {
  try {
    const authResult = await verifyAuth(auth, address as `0x${string}`);
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    if (targetType !== "post") {
      return {
        success: false,
        error: "Category attachment uploads are not supported by this action",
      };
    }

    const authenticatedAddress = authResult.address.toLowerCase();
    const canAttach = await assertCanAttachToPost(
      targetId,
      authenticatedAddress
    );
    if (!canAttach.ok) {
      return { success: false, error: canAttach.error };
    }

    const rateLimitError = validateUploadRateLimit({
      address: authenticatedAddress,
      scope: "attachment",
    });
    if (rateLimitError) {
      return { success: false, error: rateLimitError };
    }

    const { slug } = Tenant.current();

    const buffer = decodeBase64Upload(attachmentData.base64Data);
    const validationError = validateUploadBuffer({
      buffer,
      contentType: attachmentData.contentType,
      allowedContentTypes: ALLOWED_FORUM_ATTACHMENT_CONTENT_TYPES,
    });
    if (validationError) {
      return { success: false, error: validationError };
    }

    const uploadResult = await uploadFileToPinata(buffer, {
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

    const newAttachment = await prismaWeb2Client.forumPostAttachment.create({
      data: {
        dao_slug: slug,
        ipfsCid: uploadResult.IpfsHash,
        fileName: attachmentData.fileName,
        contentType: attachmentData.contentType,
        fileSize: BigInt(attachmentData.fileSize),
        address: authenticatedAddress,
        postId: targetId,
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
  }
}

// Upload to IPFS only (for temporary uploads during composition)
export async function uploadToIPFSOnly(
  attachmentData: AttachmentData,
  address: string,
  auth: AuthParams
) {
  try {
    const authResult = await verifyAuth(auth, address as `0x${string}`);
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const authenticatedAddress = authResult.address.toLowerCase();

    const rateLimitError = validateUploadRateLimit({
      address: authenticatedAddress,
      scope: "inline-image",
    });
    if (rateLimitError) {
      return { success: false, error: rateLimitError };
    }

    const buffer = decodeBase64Upload(attachmentData.base64Data);
    const validationError = validateUploadBuffer({
      buffer,
      contentType: attachmentData.contentType,
      allowedContentTypes: ALLOWED_INLINE_IMAGE_CONTENT_TYPES,
    });
    if (validationError) {
      return { success: false, error: validationError };
    }

    const uploadResult = await uploadFileToPinata(buffer, {
      name: attachmentData.fileName,
      keyvalues: {
        type: "forum-attachment",
        originalName: attachmentData.fileName,
        contentType: attachmentData.contentType,
        uploadedAt: Date.now(),
        uploadedBy: authenticatedAddress,
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
