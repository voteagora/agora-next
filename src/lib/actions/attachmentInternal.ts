import Tenant from "@/lib/tenant/tenant";
import { prismaWeb2Client } from "@/app/lib/prisma";

async function createAttachmentRecord(
  ipfsCid: string,
  fileName: string,
  contentType: string,
  fileSize: number,
  address: string,
  targetType: "post" | "category",
  targetId: number
) {
  const { slug } = Tenant.current();

  if (targetType === "post") {
    return prismaWeb2Client.forumPostAttachment.create({
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
  }

  return prismaWeb2Client.forumCategoryAttachment.create({
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
}

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
    return await createAttachmentRecord(
      ipfsCid,
      fileName,
      contentType,
      fileSize,
      address,
      targetType,
      targetId
    );
  } catch (error) {
    console.error("Attachment creation failed:", error);
    throw error;
  }
}

export async function createAttachmentsFromContent(
  content: string,
  address: string,
  targetType: "post" | "category",
  targetId: number
) {
  try {
    const ipfsUrlRegex =
      /https:\/\/gateway\.pinata\.cloud\/ipfs\/([a-zA-Z0-9]+)/g;
    const matches = Array.from(content.matchAll(ipfsUrlRegex));

    if (matches.length === 0) {
      return [];
    }

    const attachments = [];

    for (const match of matches) {
      const ipfsCid = match[1];
      const fileName = `image_${ipfsCid.substring(0, 8)}.jpg`;

      try {
        const attachment = await createAttachmentFromIPFS(
          ipfsCid,
          fileName,
          "image/jpeg",
          0,
          address,
          targetType,
          targetId
        );

        attachments.push(attachment);
      } catch (error) {
        console.error(`Failed to create attachment for ${ipfsCid}:`, error);
      }
    }

    return attachments;
  } catch (error) {
    console.error("Failed to create attachments from content:", error);
    throw error;
  }
}
