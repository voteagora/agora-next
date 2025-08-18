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
  uploadedBy: z.string().optional(),
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
              archived: false,
            },
          })
        : [],
      postIds.length > 0
        ? prisma.forumAttachment.findMany({
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
    await prisma.$disconnect();
  }
}

export async function getForumTopic(topicId: number) {
  try {
    const topic = await prisma.forumTopic.findUnique({
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

export async function deleteForumPost(postId: number) {
  try {
    const { slug } = Tenant.current();

    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    await prisma.forumPost.delete({
      where: {
        id: postId,
        dao_slug: slug,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting forum post:", error);
    return {
      success: false,
      error: "Failed to delete post",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteForumAttachment(attachmentId: number) {
  try {
    const { slug } = Tenant.current();

    const attachment = await prisma.forumAttachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      return { success: false, error: "Attachment not found" };
    }

    await prisma.forumAttachment.delete({
      where: {
        id: attachmentId,
        dao_slug: slug,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting forum document:", error);
    return {
      success: false,
      error: "Failed to delete document",
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

export async function getForumAttachments() {
  try {
    const { slug } = Tenant.current();
    const whereClause: any = {
      dao_slug: slug,
      targetType: AttachableType.category,
      targetId: 0,
      archived: false,
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

export async function uploadDocumentFromBase64(
  attachmentData: AttachmentData,
  uploadedBy: string
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
      uploadedBy: uploadedBy,
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

export async function archiveForumTopic(topicId: number) {
  try {
    const { slug } = Tenant.current();

    await prisma.forumTopic.update({
      where: {
        id: topicId,
        dao_slug: slug,
      },
      data: {
        archived: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error archiving forum topic:", error);
    return {
      success: false,
      error: "Failed to archive topic",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function archiveForumAttachment(attachmentId: number) {
  try {
    const { slug } = Tenant.current();

    await prisma.forumAttachment.update({
      where: {
        id: attachmentId,
        dao_slug: slug,
      },
      data: {
        archived: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error archiving forum attachment:", error);
    return {
      success: false,
      error: "Failed to archive attachment",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getForumCategories() {
  try {
    const { slug } = Tenant.current();

    const categories = await prisma.forumCategory.findMany({
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
    await prisma.$disconnect();
  }
}

export async function getForumCategory(categoryId: number) {
  try {
    const { slug } = Tenant.current();

    const category = await prisma.forumCategory.findFirst({
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
    await prisma.$disconnect();
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
              archived: false,
            },
          })
        : [],
      postIds.length > 0
        ? prisma.forumAttachment.findMany({
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
    await prisma.$disconnect();
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
    await prisma.$disconnect();
  }
}

export async function unarchiveForumTopic(topicId: number) {
  try {
    const { slug } = Tenant.current();

    await prisma.forumTopic.update({
      where: {
        id: topicId,
        dao_slug: slug,
      },
      data: {
        archived: false,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error unarchiving forum topic:", error);
    return {
      success: false,
      error: "Failed to unarchive topic",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function unarchiveForumAttachment(attachmentId: number) {
  try {
    const { slug } = Tenant.current();

    await prisma.forumAttachment.update({
      where: {
        id: attachmentId,
        dao_slug: slug,
      },
      data: {
        archived: false,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error unarchiving forum attachment:", error);
    return {
      success: false,
      error: "Failed to unarchive attachment",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getArchivedForumCategories() {
  try {
    const { slug } = Tenant.current();

    const categories = await prisma.forumCategory.findMany({
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
    await prisma.$disconnect();
  }
}

export async function unarchiveForumCategory(
  categoryId: number,
  adminAddress: string
) {
  try {
    const { slug } = Tenant.current();

    // Check if the person unarchiving is an admin
    const currentAdmin = await prisma.forumAdmin.findUnique({
      where: {
        dao_slug_address: {
          dao_slug: slug,
          address: adminAddress.toLowerCase(),
        },
      },
    });

    if (!currentAdmin) {
      return {
        success: false,
        error: "Only forum admins can unarchive categories",
      };
    }

    const category = await prisma.forumCategory.findFirst({
      where: {
        id: categoryId,
        dao_slug: slug,
        archived: true,
      },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    await prisma.forumCategory.update({
      where: {
        id: categoryId,
        dao_slug: slug,
      },
      data: {
        archived: false,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error unarchiving forum category:", error);
    return {
      success: false,
      error: "Failed to unarchive category",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Forum Admin Management

export async function getForumAdmins() {
  try {
    const { slug } = Tenant.current();

    const admins = await prisma.forumAdmin.findMany({
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
    await prisma.$disconnect();
  }
}

export async function addForumAdmin(address: string, adminAddress: string) {
  try {
    const { slug } = Tenant.current();

    // Check if the person adding is already an admin
    const currentAdmin = await prisma.forumAdmin.findUnique({
      where: {
        dao_slug_address: {
          dao_slug: slug,
          address: adminAddress.toLowerCase(),
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
    const admin = await prisma.forumAdmin.create({
      data: {
        dao_slug: slug,
        address: address.toLowerCase(),
      },
    });

    return {
      success: true,
      data: admin,
    };
  } catch (error) {
    console.error("Error adding forum admin:", error);
    return {
      success: false,
      error:
        error instanceof Error && error.message.includes("unique constraint")
          ? "User is already an admin"
          : "Failed to add forum admin",
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function removeForumAdmin(address: string, adminAddress: string) {
  try {
    const { slug } = Tenant.current();

    // Check if the person removing is an admin
    const currentAdmin = await prisma.forumAdmin.findUnique({
      where: {
        dao_slug_address: {
          dao_slug: slug,
          address: adminAddress.toLowerCase(),
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
    await prisma.forumAdmin.delete({
      where: {
        dao_slug_address: {
          dao_slug: slug,
          address: address.toLowerCase(),
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error removing forum admin:", error);
    return {
      success: false,
      error: "Failed to remove forum admin",
    };
  } finally {
    await prisma.$disconnect();
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

    const permissions = await prisma.forumPermission.findMany({
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
    await prisma.$disconnect();
  }
}

export async function addForumPermission(
  address: string,
  permissionType: string,
  scope: "forum" | "category",
  scopeId: number | null,
  adminAddress: string
) {
  try {
    const { slug } = Tenant.current();

    // Check if the person adding is an admin
    const currentAdmin = await prisma.forumAdmin.findUnique({
      where: {
        dao_slug_address: {
          dao_slug: slug,
          address: adminAddress.toLowerCase(),
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
    const permission = await prisma.forumPermission.create({
      data: {
        dao_slug: slug,
        address: address.toLowerCase(),
        permissionType: permissionType as any,
        scope: scope,
        scopeId: scopeId,
      },
    });

    return {
      success: true,
      data: permission,
    };
  } catch (error) {
    console.error("Error adding forum permission:", error);
    return {
      success: false,
      error:
        error instanceof Error && error.message.includes("unique constraint")
          ? "Permission already exists"
          : "Failed to add forum permission",
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function removeForumPermission(
  permissionId: number,
  adminAddress: string
) {
  try {
    const { slug } = Tenant.current();

    // Check if the person removing is an admin
    const currentAdmin = await prisma.forumAdmin.findUnique({
      where: {
        dao_slug_address: {
          dao_slug: slug,
          address: adminAddress.toLowerCase(),
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
    await prisma.forumPermission.delete({
      where: {
        id: permissionId,
        dao_slug: slug,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error removing forum permission:", error);
    return {
      success: false,
      error: "Failed to remove forum permission",
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function checkForumPermissions(
  address: string,
  categoryId?: number
) {
  try {
    const { slug } = Tenant.current();

    // Check if user is a forum admin
    const forumAdmin = await prisma.forumAdmin.findUnique({
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

    const permissions = await prisma.forumPermission.findMany({
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
