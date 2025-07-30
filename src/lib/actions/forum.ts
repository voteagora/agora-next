"use server";

import { z } from "zod";
import { PrismaClient, AttachableType } from "@prisma/client";
import { uploadFileToPinata, getIPFSUrl } from "@/lib/pinata";
import Tenant from "@/lib/tenant/tenant";
import verifyMessage from "@/lib/serverVerifyMessage";

const prisma = new PrismaClient();

const createTopicSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  categoryId: z.number().optional(),
  address: z.string().min(1, "Address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Signed message is required"),
});

const createPostSchema = z.object({
  content: z.string().min(1, "Content is required"),
  parentId: z.number().optional(),
  address: z.string().min(1, "Address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Signed message is required"),
});

const uploadDocumentSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().min(1, "File size is required"),
  contentType: z.string().min(1, "Content type is required"),
  ipfsCid: z.string().min(1, "IPFS CID is required"),
  uploadedBy: z.string().optional().default("anonymous"),
});

export async function getForumTopics(categoryId?: number) {
  try {
    const { slug } = Tenant.current();
    const whereClause: any = {
      dao_slug: slug,
    };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    const topics = await prisma.forumTopic.findMany({
      where: whereClause,
      include: {
        posts: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (topics.length === 0) {
      return { success: true, data: [] };
    }

    const topicIds = topics.map((topic) => topic.id);
    const postIds = topics.flatMap((topic) =>
      topic.posts.map((post) => post.id)
    );

    const [topicAttachments, postAttachments] = await Promise.all([
      topicIds.length > 0
        ? prisma.forumAttachment.findMany({
            where: {
              dao_slug: slug,
              targetType: AttachableType.topic,
              targetId: { in: topicIds },
            },
          })
        : [],
      postIds.length > 0
        ? prisma.forumAttachment.findMany({
            where: {
              dao_slug: slug,
              targetType: AttachableType.post,
              targetId: { in: postIds },
            },
          })
        : [],
    ]);

    const topicAttachmentsMap = new Map<number, any[]>();
    const postAttachmentsMap = new Map<number, any[]>();

    topicAttachments.forEach((attachment) => {
      if (!topicAttachmentsMap.has(attachment.targetId)) {
        topicAttachmentsMap.set(attachment.targetId, []);
      }
      topicAttachmentsMap.get(attachment.targetId)!.push({
        id: attachment.id,
        fileName: attachment.fileName,
        contentType: attachment.contentType,
        fileSize: attachment.fileSize ? Number(attachment.fileSize) : 0,
        ipfsCid: attachment.ipfsCid,
        url: `https://gateway.pinata.cloud/ipfs/${attachment.ipfsCid}`,
        createdAt: attachment.createdAt.toISOString(),
      });
    });

    postAttachments.forEach((attachment) => {
      if (!postAttachmentsMap.has(attachment.targetId)) {
        postAttachmentsMap.set(attachment.targetId, []);
      }
      postAttachmentsMap.get(attachment.targetId)!.push({
        id: attachment.id,
        fileName: attachment.fileName,
        contentType: attachment.contentType,
        fileSize: attachment.fileSize ? Number(attachment.fileSize) : 0,
        ipfsCid: attachment.ipfsCid,
        url: `https://gateway.pinata.cloud/ipfs/${attachment.ipfsCid}`,
        createdAt: attachment.createdAt.toISOString(),
      });
    });

    const formattedTopics = topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      address: topic.address,
      createdAt: topic.createdAt.toISOString(),
      attachments: topicAttachmentsMap.get(topic.id) || [],
      posts: topic.posts.map((post) => ({
        id: post.id,
        content: post.content,
        address: post.address,
        createdAt: post.createdAt.toISOString(),
        attachments: postAttachmentsMap.get(post.id) || [],
      })),
    }));

    return { success: true, data: formattedTopics };
  } catch (error) {
    console.error("Error fetching forum topics:", error);
    return {
      success: false,
      error: "Failed to fetch topics",
      data: [],
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getForumTopic(topicId: number) {
  try {
    const topic = await prisma.forumTopic.findUnique({
      where: {
        id: topicId,
      },
      include: {
        posts: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!topic) {
      return { success: false, error: "Topic not found" };
    }

    const formattedTopic = {
      id: topic.id,
      title: topic.title,
      address: topic.address,
      createdAt: topic.createdAt.toISOString(),
    };

    const formattedPosts = topic.posts.map((post) => ({
      id: post.id,
      content: post.content,
      address: post.address,
      createdAt: post.createdAt.toISOString(),
      parentPostId: post.parentPostId,
    }));

    return {
      success: true,
      topic: formattedTopic,
      posts: formattedPosts,
    };
  } catch (error) {
    console.error("Error fetching forum topic:", error);
    return { success: false, error: "Failed to fetch topic" };
  } finally {
    await prisma.$disconnect();
  }
}

export async function createForumTopic(
  data: z.infer<typeof createTopicSchema>
) {
  try {
    const validatedData = createTopicSchema.parse(data);
    const { slug } = Tenant.current();

    const isValid = await verifyMessage({
      address: validatedData.address as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    const newTopic = await prisma.forumTopic.create({
      data: {
        title: validatedData.title,
        address: validatedData.address,
        dao_slug: slug,
        categoryId: validatedData.categoryId || null,
      },
    });

    const newPost = await prisma.forumPost.create({
      data: {
        content: validatedData.content,
        address: validatedData.address,
        topicId: newTopic.id,
        dao_slug: slug,
      },
    });

    return {
      success: true,
      topic: {
        id: newTopic.id,
        title: newTopic.title,
        address: newTopic.address,
        createdAt: newTopic.createdAt.toISOString(),
      },
      post: {
        id: newPost.id,
        content: newPost.content,
        address: newPost.address,
        createdAt: newPost.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error creating forum topic:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: "Failed to create topic",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteForumTopic(topicId: number) {
  try {
    const { slug } = Tenant.current();

    await prisma.forumPost.deleteMany({
      where: {
        topicId: topicId,
        dao_slug: slug,
      },
    });

    await prisma.forumTopic.delete({
      where: {
        id: topicId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting forum topic:", error);
    return {
      success: false,
      error: "Failed to delete topic",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function createForumPost(
  topicId: number,
  data: z.infer<typeof createPostSchema>
) {
  try {
    const validatedData = createPostSchema.parse(data);
    const { slug } = Tenant.current();

    const isValid = await verifyMessage({
      address: validatedData.address as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    const topic = await prisma.forumTopic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return { success: false, error: "Topic not found" };
    }

    const newPost = await prisma.forumPost.create({
      data: {
        content: validatedData.content,
        address: validatedData.address,
        topicId: topicId,
        parentPostId: validatedData.parentId || null,
        dao_slug: slug,
      },
    });

    return {
      success: true,
      post: {
        id: newPost.id,
        address: newPost.address,
        content: newPost.content,
        createdAt: newPost.createdAt.toISOString(),
        parentPostId: newPost.parentPostId,
      },
    };
  } catch (error) {
    console.error("Error creating forum post:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: "Failed to create post",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getForumDocuments() {
  try {
    const { slug } = Tenant.current();
    const whereClause: any = {
      dao_slug: slug,
      targetType: AttachableType.category,
      targetId: 0,
    };

    const documents = await prisma.forumAttachment.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedDocuments = documents.map((doc) => ({
      id: doc.id,
      name: doc.fileName || `Document ${doc.id}`,
      url: `https://gateway.pinata.cloud/ipfs/${doc.ipfsCid}`,
      ipfsCid: doc.ipfsCid,
      fileSize: doc.fileSize ? Number(doc.fileSize) : 0,
      contentType: doc.contentType || "application/octet-stream",
      createdAt: doc.createdAt.toISOString(),
      uploadedBy: doc.address || "anonymous",
    }));

    return { success: true, data: formattedDocuments };
  } catch (error) {
    console.error("Error fetching forum documents:", error);
    return {
      success: false,
      error: "Failed to fetch documents",
      data: [],
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function uploadForumDocument(
  data: z.infer<typeof uploadDocumentSchema>
) {
  try {
    const validatedData = uploadDocumentSchema.parse(data);
    const { slug } = Tenant.current();

    const newAttachment = await prisma.forumAttachment.create({
      data: {
        dao_slug: slug,
        ipfsCid: validatedData.ipfsCid,
        fileName: validatedData.fileName,
        contentType: validatedData.contentType,
        fileSize: BigInt(validatedData.fileSize),
        address: validatedData.uploadedBy,
        targetType: AttachableType.category,
        targetId: 0,
      },
    });

    const formattedDocument = {
      id: newAttachment.id,
      name: newAttachment.fileName || `Document ${newAttachment.id}`,
      url: `https://gateway.pinata.cloud/ipfs/${newAttachment.ipfsCid}`,
      ipfsCid: newAttachment.ipfsCid,
      fileSize: newAttachment.fileSize ? Number(newAttachment.fileSize) : 0,
      contentType: newAttachment.contentType || "application/octet-stream",
      createdAt: newAttachment.createdAt.toISOString(),
      uploadedBy: newAttachment.address || "anonymous",
    };

    return { success: true, document: formattedDocument };
  } catch (error) {
    console.error("Error uploading forum document:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: "Failed to upload document",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function uploadFileToIPFS(file: File) {
  try {
    const uploadResult = await uploadFileToPinata(file, {
      name: file.name,
      keyvalues: {
        type: "forum-document",
        originalName: file.name,
        contentType: file.type,
        uploadedAt: Date.now(),
      },
    });

    const ipfsUrl = getIPFSUrl(uploadResult.IpfsHash);

    return {
      success: true,
      ipfsCid: uploadResult.IpfsHash,
      ipfsUrl,
      fileSize: file.size,
      contentType: file.type,
      fileName: file.name,
    };
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload to IPFS",
    };
  }
}

interface AttachmentData {
  fileName: string;
  contentType: string;
  fileSize: number;
  base64Data: string;
}

export async function uploadDocumentFromBase64(attachmentData: AttachmentData) {
  try {
    const buffer = Buffer.from(attachmentData.base64Data, "base64");
    const fileBlob = new Blob([buffer], { type: attachmentData.contentType });
    const file = new File([fileBlob], attachmentData.fileName, {
      type: attachmentData.contentType,
    });

    const ipfsResult = await uploadFileToIPFS(file);

    if (!ipfsResult.success) {
      throw new Error(ipfsResult.error || "Failed to upload to IPFS");
    }

    const result = await uploadForumDocument({
      fileName: attachmentData.fileName,
      fileSize: attachmentData.fileSize,
      contentType: attachmentData.contentType,
      ipfsCid: ipfsResult.ipfsCid || "",
      uploadedBy: "anonymous",
    });

    return result;
  } catch (error) {
    console.error("Error uploading document from base64:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload document",
    };
  }
}
