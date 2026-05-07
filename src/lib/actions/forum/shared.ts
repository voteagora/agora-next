import { z } from "zod";

const authFields = {
  address: z.string().min(1, "Address is required"),
  signature: z.string().optional(),
  message: z.string().optional(),
  jwt: z.string().optional(),
};

export const createTopicSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  categoryId: z.number().optional(),
  ...authFields,
});

export const createPostSchema = z.object({
  content: z.string().min(1, "Content is required"),
  parentId: z.number().optional(),
  ...authFields,
});

export const uploadDocumentSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().min(1, "File size is required"),
  contentType: z.string().min(1, "Content type is required"),
  ipfsCid: z.string().min(1, "IPFS CID is required"),
  ...authFields,
});

export const deleteTopicSchema = z.object({
  topicId: z.number().min(1, "Topic ID is required"),
  ...authFields,
});

export const deletePostSchema = z.object({
  postId: z.number().min(1, "Post ID is required"),
  ...authFields,
});

export const softDeleteTopicSchema = z.object({
  topicId: z.number().min(1, "Topic ID is required"),
  ...authFields,
});

export const softDeletePostSchema = z.object({
  postId: z.number().min(1, "Post ID is required"),
  ...authFields,
});

export const archiveTopicSchema = z.object({
  topicId: z.number().min(1, "Topic ID is required"),
  ...authFields,
});

export const archiveAttachmentSchema = z.object({
  attachmentId: z.number().min(1, "Attachment ID is required"),
  targetType: z.enum(["post", "category"]),
  ...authFields,
});

export function handlePrismaError(error: any) {
  if (error instanceof z.ZodError) {
    return {
      success: false as const,
      error: "Validation error",
      details: error.errors,
    };
  }

  return {
    success: false as const,
    error: "Database operation failed",
    details: error instanceof Error ? error.message : "Unknown error",
  };
}
