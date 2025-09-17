"use server";

import { z } from "zod";
import { AttachableType } from "@prisma/client";
import { uploadFileToPinata, getIPFSUrl } from "@/lib/pinata";
import Tenant from "@/lib/tenant/tenant";
import verifyMessage from "@/lib/serverVerifyMessage";
import { prismaWeb2Client } from "@/app/lib/prisma";

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
  address: z.string().min(1, "Address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Signed message is required"),
});

export async function getForumTopics(categoryId?: number) {
  try {
    const { slug } = Tenant.current();
    const whereClause: any = {
      dao_slug: slug,
      archived: false,
    };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    const topics = await prismaWeb2Client.forumTopic.findMany({
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
        ? prismaWeb2Client.forumAttachment.findMany({
            where: {
              dao_slug: slug,
              targetType: AttachableType.topic,
              targetId: { in: topicIds },
              archived: false,
            },
          })
        : [],
      postIds.length > 0
        ? prismaWeb2Client.forumAttachment.findMany({
            where: {
              dao_slug: slug,
              targetType: AttachableType.post,
              targetId: { in: postIds },
              archived: false,
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
        parentPostId: post.parentPostId,
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
    await prismaWeb2Client.$disconnect();
  }
}

export async function getForumTopic(topicId: number) {
  try {
    const topic = await prismaWeb2Client.forumTopic.findUnique({
      where: {
        id: topicId,
        archived: false,
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
    await prismaWeb2Client.$disconnect();
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

    const newTopic = await prismaWeb2Client.forumTopic.create({
      data: {
        title: validatedData.title,
        address: validatedData.address,
        dao_slug: slug,
        categoryId: validatedData.categoryId || null,
      },
    });

    const newPost = await prismaWeb2Client.forumPost.create({
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
    await prismaWeb2Client.$disconnect();
  }
}

const deleteTopicSchema = z.object({
  topicId: z.number().min(1, "Topic ID is required"),
  address: z.string().min(1, "Address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Signed message is required"),
});

// Internal function for cleanup operations (bypasses signature verification)
async function _deleteForumTopicInternal(topicId: number) {
  try {
    const { slug } = Tenant.current();

    await prismaWeb2Client.forumPost.deleteMany({
      where: {
        topicId: topicId,
        dao_slug: slug,
      },
    });

    await prismaWeb2Client.forumTopic.delete({
      where: {
        id: topicId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting forum topic (internal):", error);
    return {
      success: false,
      error: "Failed to delete topic",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

export async function deleteForumTopic(
  data:
    | z.infer<typeof deleteTopicSchema>
    | { topicId: number; _internal?: boolean }
) {
  // Allow internal cleanup operations to bypass signature verification
  if ("_internal" in data && data._internal) {
    return _deleteForumTopicInternal(data.topicId);
  }

  try {
    const validatedData = deleteTopicSchema.parse(data);
    const { slug } = Tenant.current();

    const isValid = await verifyMessage({
      address: validatedData.address as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    await prismaWeb2Client.forumPost.deleteMany({
      where: {
        topicId: validatedData.topicId,
        dao_slug: slug,
      },
    });

    await prismaWeb2Client.forumTopic.delete({
      where: {
        id: validatedData.topicId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting forum topic:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: "Failed to delete topic",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

const deletePostSchema = z.object({
  postId: z.number().min(1, "Post ID is required"),
  address: z.string().min(1, "Address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Signed message is required"),
});

export async function deleteForumPost(data: z.infer<typeof deletePostSchema>) {
  try {
    const validatedData = deletePostSchema.parse(data);
    const { slug } = Tenant.current();

    const isValid = await verifyMessage({
      address: validatedData.address as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    const post = await prismaWeb2Client.forumPost.findUnique({
      where: { id: validatedData.postId },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    await prismaWeb2Client.forumPost.delete({
      where: {
        id: validatedData.postId,
        dao_slug: slug,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting forum post:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: "Failed to delete post",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

const deleteAttachmentSchema = z.object({
  attachmentId: z.number().min(1, "Attachment ID is required"),
  address: z.string().min(1, "Address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Signed message is required"),
});

export async function deleteForumAttachment(
  data: z.infer<typeof deleteAttachmentSchema>
) {
  try {
    const validatedData = deleteAttachmentSchema.parse(data);
    const { slug } = Tenant.current();

    const isValid = await verifyMessage({
      address: validatedData.address as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    const attachment = await prismaWeb2Client.forumAttachment.findUnique({
      where: { id: validatedData.attachmentId },
    });

    if (!attachment) {
      return { success: false, error: "Attachment not found" };
    }

    await prismaWeb2Client.forumAttachment.delete({
      where: {
        id: validatedData.attachmentId,
        dao_slug: slug,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting forum document:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: "Failed to delete document",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await prismaWeb2Client.$disconnect();
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

    const topic = await prismaWeb2Client.forumTopic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return { success: false, error: "Topic not found" };
    }

    const newPost = await prismaWeb2Client.forumPost.create({
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
    await prismaWeb2Client.$disconnect();
  }
}

export async function getForumAttachments({ categoryId }: { categoryId?: number }) {
  try {
    const { slug } = Tenant.current();
    const whereClause: any = {
      dao_slug: slug,
      targetType: AttachableType.category,
      targetId: categoryId || 0,
      archived: false,
    };

    const documents = await prismaWeb2Client.forumAttachment.findMany({
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
      uploadedBy: doc.address || "",
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
    await prismaWeb2Client.$disconnect();
  }
}

export async function uploadForumDocument(
  data: z.infer<typeof uploadDocumentSchema>
) {
  try {
    const validatedData = uploadDocumentSchema.parse(data);
    const { slug } = Tenant.current();

    const isValid = await verifyMessage({
      address: validatedData.address as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    const newAttachment = await prismaWeb2Client.forumAttachment.create({
      data: {
        dao_slug: slug,
        ipfsCid: validatedData.ipfsCid,
        fileName: validatedData.fileName,
        contentType: validatedData.contentType,
        fileSize: BigInt(validatedData.fileSize),
        address: validatedData.address,
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
      uploadedBy: newAttachment.address || "",
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
    await prismaWeb2Client.$disconnect();
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

export async function uploadDocumentFromBase64(
  attachmentData: AttachmentData,
  address: string,
  signature: string,
  message: string
) {
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
      address: address,
      signature: signature,
      message: message,
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

const archiveTopicSchema = z.object({
  topicId: z.number().min(1, "Topic ID is required"),
  address: z.string().min(1, "Address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Signed message is required"),
});

export async function archiveForumTopic(
  data: z.infer<typeof archiveTopicSchema>
) {
  try {
    const validatedData = archiveTopicSchema.parse(data);
    const { slug } = Tenant.current();

    const isValid = await verifyMessage({
      address: validatedData.address as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    await prismaWeb2Client.forumTopic.update({
      where: {
        id: validatedData.topicId,
        dao_slug: slug,
      },
      data: {
        archived: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error archiving forum topic:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: "Failed to archive topic",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

const archiveAttachmentSchema = z.object({
  attachmentId: z.number().min(1, "Attachment ID is required"),
  address: z.string().min(1, "Address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Signed message is required"),
});

export async function archiveForumAttachment(
  data: z.infer<typeof archiveAttachmentSchema>
) {
  try {
    const validatedData = archiveAttachmentSchema.parse(data);
    const { slug } = Tenant.current();

    const isValid = await verifyMessage({
      address: validatedData.address as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    await prismaWeb2Client.forumAttachment.update({
      where: {
        id: validatedData.attachmentId,
        dao_slug: slug,
      },
      data: {
        archived: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error archiving forum attachment:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: "Failed to archive attachment",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

export async function getForumCategories() {
  try {
    const { slug } = Tenant.current();

    const categories = await prismaWeb2Client.forumCategory.findMany({
      where: {
        dao_slug: slug,
        archived: false,
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching forum categories:", error);
    return {
      success: false,
      error: "Failed to fetch categories",
      data: [],
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

export async function getForumCategory(categoryId: number) {
  try {
    const { slug } = Tenant.current();

    const category = await prismaWeb2Client.forumCategory.findFirst({
      where: {
        id: categoryId,
        dao_slug: slug,
        archived: false,
      },
    });

    return { success: true, data: category };
  } catch (error) {
    console.error("Error fetching forum category:", error);
    return null;
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

export async function getArchivedForumTopics(categoryId?: number) {
  try {
    const { slug } = Tenant.current();
    const whereClause: any = {
      dao_slug: slug,
      archived: true,
    };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    const topics = await prismaWeb2Client.forumTopic.findMany({
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
        ? prismaWeb2Client.forumAttachment.findMany({
            where: {
              dao_slug: slug,
              targetType: AttachableType.topic,
              targetId: { in: topicIds },
              archived: false,
            },
          })
        : [],
      postIds.length > 0
        ? prismaWeb2Client.forumAttachment.findMany({
            where: {
              dao_slug: slug,
              targetType: AttachableType.post,
              targetId: { in: postIds },
              archived: false,
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
    console.error("Error fetching archived forum topics:", error);
    return {
      success: false,
      error: "Failed to fetch archived topics",
      data: [],
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

export async function getArchivedForumAttachments() {
  try {
    const { slug } = Tenant.current();
    const whereClause: any = {
      dao_slug: slug,
      targetType: AttachableType.category,
      targetId: 0,
      archived: true,
    };

    const documents = await prismaWeb2Client.forumAttachment.findMany({
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
      uploadedBy: doc.address || "",
    }));

    return { success: true, data: formattedDocuments };
  } catch (error) {
    console.error("Error fetching archived forum documents:", error);
    return {
      success: false,
      error: "Failed to fetch archived documents",
      data: [],
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

const unarchiveTopicSchema = z.object({
  topicId: z.number().min(1, "Topic ID is required"),
  address: z.string().min(1, "Address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Signed message is required"),
});

export async function unarchiveForumTopic(
  data: z.infer<typeof unarchiveTopicSchema>
) {
  try {
    const validatedData = unarchiveTopicSchema.parse(data);
    const { slug } = Tenant.current();

    const isValid = await verifyMessage({
      address: validatedData.address as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    await prismaWeb2Client.forumTopic.update({
      where: {
        id: validatedData.topicId,
        dao_slug: slug,
      },
      data: {
        archived: false,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error unarchiving forum topic:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: "Failed to unarchive topic",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

const unarchiveAttachmentSchema = z.object({
  attachmentId: z.number().min(1, "Attachment ID is required"),
  address: z.string().min(1, "Address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Signed message is required"),
});

export async function unarchiveForumAttachment(
  data: z.infer<typeof unarchiveAttachmentSchema>
) {
  try {
    const validatedData = unarchiveAttachmentSchema.parse(data);
    const { slug } = Tenant.current();

    const isValid = await verifyMessage({
      address: validatedData.address as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    await prismaWeb2Client.forumAttachment.update({
      where: {
        id: validatedData.attachmentId,
        dao_slug: slug,
      },
      data: {
        archived: false,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error unarchiving forum attachment:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: "Failed to unarchive attachment",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

export async function getArchivedForumCategories() {
  try {
    const { slug } = Tenant.current();

    const categories = await prismaWeb2Client.forumCategory.findMany({
      where: {
        dao_slug: slug,
        archived: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching archived forum categories:", error);
    return {
      success: false,
      error: "Failed to fetch archived categories",
      data: [],
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

const unarchiveCategorySchema = z.object({
  categoryId: z.number().min(1, "Category ID is required"),
  adminAddress: z.string().min(1, "Admin address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Signed message is required"),
});

export async function unarchiveForumCategory(
  data: z.infer<typeof unarchiveCategorySchema>
) {
  try {
    const validatedData = unarchiveCategorySchema.parse(data);
    const { slug } = Tenant.current();

    // Verify the admin's signature
    const isValid = await verifyMessage({
      address: validatedData.adminAddress as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    // Check if the person unarchiving is an admin
    const currentAdmin = await prismaWeb2Client.forumAdmin.findUnique({
      where: {
        dao_slug_address: {
          dao_slug: slug,
          address: validatedData.adminAddress.toLowerCase(),
        },
      },
    });

    if (!currentAdmin) {
      return {
        success: false,
        error: "Only forum admins can unarchive categories",
      };
    }

    const category = await prismaWeb2Client.forumCategory.findFirst({
      where: {
        id: validatedData.categoryId,
        dao_slug: slug,
        archived: true,
      },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    await prismaWeb2Client.forumCategory.update({
      where: {
        id: validatedData.categoryId,
        dao_slug: slug,
      },
      data: {
        archived: false,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error unarchiving forum category:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: "Failed to unarchive category",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

// Forum Admin Management

export async function getForumAdmins() {
  try {
    const { slug } = Tenant.current();

    const admins = await prismaWeb2Client.forumAdmin.findMany({
      where: {
        dao_slug: slug,
      },
      orderBy: {
        address: "asc",
      },
    });

    return {
      success: true,
      data: admins,
    };
  } catch (error) {
    console.error("Error fetching forum admins:", error);
    return {
      success: false,
      error: "Failed to fetch forum admins",
      data: [],
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

const addAdminSchema = z.object({
  address: z.string().min(1, "Address is required"),
  adminAddress: z.string().min(1, "Admin address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Signed message is required"),
});

export async function addForumAdmin(data: z.infer<typeof addAdminSchema>) {
  try {
    const validatedData = addAdminSchema.parse(data);
    const { slug } = Tenant.current();

    // Verify the admin's signature
    const isValid = await verifyMessage({
      address: validatedData.adminAddress as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    // Check if the person adding is already an admin
    const currentAdmin = await prismaWeb2Client.forumAdmin.findUnique({
      where: {
        dao_slug_address: {
          dao_slug: slug,
          address: validatedData.adminAddress.toLowerCase(),
        },
      },
    });

    if (!currentAdmin) {
      return {
        success: false,
        error: "Only forum admins can add new admins",
      };
    }

    // Add new admin
    const admin = await prismaWeb2Client.forumAdmin.create({
      data: {
        dao_slug: slug,
        address: validatedData.address.toLowerCase(),
      },
    });

    return {
      success: true,
      data: admin,
    };
  } catch (error) {
    console.error("Error adding forum admin:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error && error.message.includes("unique constraint")
          ? "User is already an admin"
          : "Failed to add forum admin",
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

const removeAdminSchema = z.object({
  address: z.string().min(1, "Address is required"),
  adminAddress: z.string().min(1, "Admin address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Signed message is required"),
});

export async function removeForumAdmin(
  data: z.infer<typeof removeAdminSchema>
) {
  try {
    const validatedData = removeAdminSchema.parse(data);
    const { slug } = Tenant.current();

    // Verify the admin's signature
    const isValid = await verifyMessage({
      address: validatedData.adminAddress as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    // Check if the person removing is an admin
    const currentAdmin = await prismaWeb2Client.forumAdmin.findUnique({
      where: {
        dao_slug_address: {
          dao_slug: slug,
          address: validatedData.adminAddress.toLowerCase(),
        },
      },
    });

    if (!currentAdmin) {
      return {
        success: false,
        error: "Only forum admins can remove admins",
      };
    }

    // Remove admin
    await prismaWeb2Client.forumAdmin.delete({
      where: {
        dao_slug_address: {
          dao_slug: slug,
          address: validatedData.address.toLowerCase(),
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error removing forum admin:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: "Failed to remove forum admin",
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

// Forum Permission Management

export async function getForumPermissions(address?: string) {
  try {
    const { slug } = Tenant.current();

    const whereClause: any = {
      dao_slug: slug,
    };

    if (address) {
      whereClause.address = address.toLowerCase();
    }

    const permissions = await prismaWeb2Client.forumPermission.findMany({
      where: whereClause,
      orderBy: [{ address: "asc" }, { permissionType: "asc" }],
    });

    return {
      success: true,
      data: permissions,
    };
  } catch (error) {
    console.error("Error fetching forum permissions:", error);
    return {
      success: false,
      error: "Failed to fetch forum permissions",
      data: [],
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

const addPermissionSchema = z.object({
  address: z.string().min(1, "Address is required"),
  permissionType: z.string().min(1, "Permission type is required"),
  scope: z.enum(["forum", "category"]),
  scopeId: z.number().nullable(),
  adminAddress: z.string().min(1, "Admin address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Signed message is required"),
});

export async function addForumPermission(
  data: z.infer<typeof addPermissionSchema>
) {
  try {
    const validatedData = addPermissionSchema.parse(data);
    const { slug } = Tenant.current();

    // Verify the admin's signature
    const isValid = await verifyMessage({
      address: validatedData.adminAddress as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    // Check if the person adding is an admin
    const currentAdmin = await prismaWeb2Client.forumAdmin.findUnique({
      where: {
        dao_slug_address: {
          dao_slug: slug,
          address: validatedData.adminAddress.toLowerCase(),
        },
      },
    });

    if (!currentAdmin) {
      return {
        success: false,
        error: "Only forum admins can manage permissions",
      };
    }

    // Add permission
    const permission = await prismaWeb2Client.forumPermission.create({
      data: {
        dao_slug: slug,
        address: validatedData.address.toLowerCase(),
        permissionType: validatedData.permissionType as any,
        scope: validatedData.scope,
        scopeId: validatedData.scopeId,
      },
    });

    return {
      success: true,
      data: permission,
    };
  } catch (error) {
    console.error("Error adding forum permission:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error && error.message.includes("unique constraint")
          ? "Permission already exists"
          : "Failed to add forum permission",
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

const removePermissionSchema = z.object({
  permissionId: z.number().min(1, "Permission ID is required"),
  adminAddress: z.string().min(1, "Admin address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Signed message is required"),
});

export async function removeForumPermission(
  data: z.infer<typeof removePermissionSchema>
) {
  try {
    const validatedData = removePermissionSchema.parse(data);
    const { slug } = Tenant.current();

    // Verify the admin's signature
    const isValid = await verifyMessage({
      address: validatedData.adminAddress as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    // Check if the person removing is an admin
    const currentAdmin = await prismaWeb2Client.forumAdmin.findUnique({
      where: {
        dao_slug_address: {
          dao_slug: slug,
          address: validatedData.adminAddress.toLowerCase(),
        },
      },
    });

    if (!currentAdmin) {
      return {
        success: false,
        error: "Only forum admins can manage permissions",
      };
    }

    // Remove permission
    await prismaWeb2Client.forumPermission.delete({
      where: {
        id: validatedData.permissionId,
        dao_slug: slug,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error removing forum permission:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: "Failed to remove forum permission",
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

export async function checkForumPermissions(
  address: string,
  categoryId?: number
) {
  try {
    const { slug } = Tenant.current();

    // Check if user is a forum admin
    const forumAdmin = await prismaWeb2Client.forumAdmin.findUnique({
      where: {
        dao_slug_address: {
          dao_slug: slug,
          address: address.toLowerCase(),
        },
      },
    });

    const isAdmin = !!forumAdmin;

    // If admin, grant all permissions
    if (isAdmin) {
      return {
        isAdmin: true,
        canCreateTopics: true,
        canManageTopics: true,
        canCreateAttachments: true,
        canManageAttachments: true,
      };
    }

    const permissions = await prismaWeb2Client.forumPermission.findMany({
      where: {
        dao_slug: slug,
        address: address.toLowerCase(),
        OR: [
          { scope: "forum", scopeId: null },
          ...(categoryId
            ? [{ scope: "category" as any, scopeId: categoryId }]
            : []),
        ],
      },
    });

    const permissionTypes = permissions.map((p) => p.permissionType);

    // Check category restrictions
    let canCreateTopics = true;
    if (categoryId) {
      const response = await getForumCategory(categoryId);
      const category = response?.data;
      canCreateTopics =
        !category?.adminOnlyTopics || permissionTypes.includes("create_topics");
    }

    return {
      isAdmin: false,
      canCreateTopics,
      canManageTopics: permissionTypes.includes("manage_topics"),
      canCreateAttachments: permissionTypes.includes("create_attachments"),
      canManageAttachments: permissionTypes.includes("manage_attachments"),
    };
  } catch (error) {
    console.error("Error checking forum permissions:", error);
    return {
      isAdmin: false,
      canCreateTopics: false,
      canManageTopics: false,
      canCreateAttachments: false,
      canManageAttachments: false,
    };
  }
}

// Forum Category Management

const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  adminOnlyTopics: z.boolean().default(false),
  adminAddress: z.string().min(1, "Admin address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Signed message is required"),
});

export async function createForumCategory(
  data: z.infer<typeof createCategorySchema>
) {
  try {
    const validatedData = createCategorySchema.parse(data);
    const { slug } = Tenant.current();

    // Verify the admin's signature
    const isValid = await verifyMessage({
      address: validatedData.adminAddress as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    // Check if the person creating is an admin
    const currentAdmin = await prismaWeb2Client.forumAdmin.findUnique({
      where: {
        dao_slug_address: {
          dao_slug: slug,
          address: validatedData.adminAddress.toLowerCase(),
        },
      },
    });

    if (!currentAdmin) {
      return {
        success: false,
        error: "Only forum admins can create categories",
      };
    }

    // Create category
    const category = await prismaWeb2Client.forumCategory.create({
      data: {
        dao_slug: slug,
        name: validatedData.name,
        description: validatedData.description || null,
        adminOnlyTopics: validatedData.adminOnlyTopics,
      },
    });

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    console.error("Error creating forum category:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error && error.message.includes("unique constraint")
          ? "Category with this name already exists"
          : "Failed to create category",
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

const updateCategorySchema = z.object({
  categoryId: z.number().min(1, "Category ID is required"),
  name: z.string().min(1, "Category name is required").optional(),
  description: z.string().optional(),
  adminOnlyTopics: z.boolean().optional(),
  adminAddress: z.string().min(1, "Admin address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Signed message is required"),
});

export async function updateForumCategory(
  data: z.infer<typeof updateCategorySchema>
) {
  try {
    const validatedData = updateCategorySchema.parse(data);
    const { slug } = Tenant.current();

    // Verify the admin's signature
    const isValid = await verifyMessage({
      address: validatedData.adminAddress as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    // Check if the person updating is an admin
    const currentAdmin = await prismaWeb2Client.forumAdmin.findUnique({
      where: {
        dao_slug_address: {
          dao_slug: slug,
          address: validatedData.adminAddress.toLowerCase(),
        },
      },
    });

    if (!currentAdmin) {
      return {
        success: false,
        error: "Only forum admins can update categories",
      };
    }

    // Check if category exists and is not archived
    const existingCategory = await prismaWeb2Client.forumCategory.findFirst({
      where: {
        id: validatedData.categoryId,
        dao_slug: slug,
        archived: false,
      },
    });

    if (!existingCategory) {
      return { success: false, error: "Category not found" };
    }

    // Prevent updating DUNA category
    if (existingCategory.name === "DUNA") {
      return {
        success: false,
        error: "DUNA category cannot be updated",
      };
    }

    // Prepare update data
    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description || null;
    if (validatedData.adminOnlyTopics !== undefined)
      updateData.adminOnlyTopics = validatedData.adminOnlyTopics;

    // Update category
    const category = await prismaWeb2Client.forumCategory.update({
      where: {
        id: validatedData.categoryId,
        dao_slug: slug,
      },
      data: updateData,
    });

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    console.error("Error updating forum category:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error && error.message.includes("unique constraint")
          ? "Category with this name already exists"
          : "Failed to update category",
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

const deleteCategorySchema = z.object({
  categoryId: z.number().min(1, "Category ID is required"),
  adminAddress: z.string().min(1, "Admin address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Signed message is required"),
});

export async function deleteForumCategory(
  data: z.infer<typeof deleteCategorySchema>
) {
  try {
    const validatedData = deleteCategorySchema.parse(data);
    const { slug } = Tenant.current();

    // Verify the admin's signature
    const isValid = await verifyMessage({
      address: validatedData.adminAddress as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    // Check if the person deleting is an admin
    const currentAdmin = await prismaWeb2Client.forumAdmin.findUnique({
      where: {
        dao_slug_address: {
          dao_slug: slug,
          address: validatedData.adminAddress.toLowerCase(),
        },
      },
    });

    if (!currentAdmin) {
      return {
        success: false,
        error: "Only forum admins can delete categories",
      };
    }

    // Check if category exists
    const existingCategory = await prismaWeb2Client.forumCategory.findFirst({
      where: {
        id: validatedData.categoryId,
        dao_slug: slug,
      },
    });

    if (!existingCategory) {
      return { success: false, error: "Category not found" };
    }

    // Prevent deleting DUNA category
    if (existingCategory.name === "DUNA") {
      return {
        success: false,
        error: "DUNA category cannot be deleted",
      };
    }

    // Check if category has topics
    const topicsCount = await prismaWeb2Client.forumTopic.count({
      where: {
        categoryId: validatedData.categoryId,
        dao_slug: slug,
      },
    });

    if (topicsCount > 0) {
      return {
        success: false,
        error:
          "Cannot delete category that contains topics. Archive it instead or move topics to another category first.",
      };
    }

    // Delete category
    await prismaWeb2Client.forumCategory.delete({
      where: {
        id: validatedData.categoryId,
        dao_slug: slug,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting forum category:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: "Failed to delete category",
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

const archiveCategorySchema = z.object({
  categoryId: z.number().min(1, "Category ID is required"),
  adminAddress: z.string().min(1, "Admin address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Signed message is required"),
});

export async function archiveForumCategory(
  data: z.infer<typeof archiveCategorySchema>
) {
  try {
    const validatedData = archiveCategorySchema.parse(data);
    const { slug } = Tenant.current();

    // Verify the admin's signature
    const isValid = await verifyMessage({
      address: validatedData.adminAddress as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    // Check if the person archiving is an admin
    const currentAdmin = await prismaWeb2Client.forumAdmin.findUnique({
      where: {
        dao_slug_address: {
          dao_slug: slug,
          address: validatedData.adminAddress.toLowerCase(),
        },
      },
    });

    if (!currentAdmin) {
      return {
        success: false,
        error: "Only forum admins can archive categories",
      };
    }

    // Check if category exists and is not already archived
    const existingCategory = await prismaWeb2Client.forumCategory.findFirst({
      where: {
        id: validatedData.categoryId,
        dao_slug: slug,
        archived: false,
      },
    });

    if (!existingCategory) {
      return {
        success: false,
        error: "Category not found or already archived",
      };
    }

    // Prevent archiving DUNA category
    if (existingCategory.name === "DUNA") {
      return {
        success: false,
        error: "DUNA category cannot be archived",
      };
    }

    // Archive category
    await prismaWeb2Client.forumCategory.update({
      where: {
        id: validatedData.categoryId,
        dao_slug: slug,
      },
      data: {
        archived: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error archiving forum category:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: "Failed to archive category",
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

export async function getDunaCategoryId() {
  try {
    const { slug } = Tenant.current();

    const dunaCategory = await prismaWeb2Client.forumCategory.findFirst({
      where: {
        dao_slug: slug,
        name: "DUNA",
        archived: false,
      },
    });

    return dunaCategory?.id || null;
  } catch (error) {
    console.error("Error fetching DUNA category ID:", error);
    return null;
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}
