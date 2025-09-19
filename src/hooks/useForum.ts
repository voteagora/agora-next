import { useState, useCallback } from "react";
import { useAccount, useSignMessage } from "wagmi";
import {
  getForumTopics,
  getForumTopic,
  createForumTopic,
  createForumPost,
  deleteForumTopic,
  deleteForumPost,
  deleteForumAttachment,
  getForumAttachments,
  uploadDocumentFromBase64,
  archiveForumTopic,
  archiveForumAttachment,
  getForumCategories,
  getArchivedForumTopics,
  getArchivedForumAttachments,
  getArchivedForumCategories,
  unarchiveForumTopic,
  unarchiveForumAttachment,
  unarchiveForumCategory,
  checkForumPermissions,
  createForumCategory,
  updateForumCategory,
  deleteForumCategory,
  archiveForumCategory,
} from "@/lib/actions/forum";
import { uploadAttachment } from "@/lib/actions/attachment";
import { convertFileToAttachmentData, AttachmentData } from "@/lib/fileUtils";
import {
  transformForumTopics,
  ForumTopic,
  ForumPost,
  ForumCategory,
} from "@/lib/forumUtils";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

interface ForumDocument {
  id: number;
  name: string;
  url: string;
  ipfsCid: string;
  createdAt: string;
  uploadedBy: string;
}

interface CreateTopicData {
  title: string;
  content: string;
  categoryId?: number;
  attachment?: File;
}

interface CreatePostData {
  content: string;
  parentId?: number;
  attachment?: File;
}

export const useForum = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const fetchTopics = useCallback(
    async (categoryId?: number): Promise<ForumTopic[]> => {
      setLoading(true);
      setError(null);

      try {
        const result = await getForumTopics(categoryId);

        if (!result.success) {
          throw new Error(result.error);
        }

        const transformedTopics = transformForumTopics(result.data);

        return transformedTopics;
      } catch (err) {
        console.error("Error fetching topics:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch topics");
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchTopic = useCallback(
    async (topicId: number): Promise<ForumTopic | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await getForumTopic(topicId);

        if (!result.success || !result.topic) {
          throw new Error(result.error || "Topic not found");
        }

        return {
          id: result.topic.id,
          title: result.topic.title,
          author: result.topic.address,
          content: result.posts?.[0]?.content || "",
          createdAt: result.topic.createdAt,
          comments:
            result.posts?.slice(1).map((post) => ({
              id: post.id,
              author: post.address,
              content: post.content,
              createdAt: post.createdAt,
              parentId: post.parentPostId || undefined,
            })) || [],
          attachments: [],
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch topic");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createTopic = useCallback(
    async (data: CreateTopicData): Promise<ForumTopic | null> => {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first");
      }

      if (data.attachment && data.attachment.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return null;
      }

      setLoading(true);
      const toastId = toast.loading("Creating topic...");
      setError(null);

      try {
        const message = `Create forum topic: ${data.title}\nContent: ${data.content}\nTimestamp: ${Date.now()}`;

        const signature = await signMessageAsync({ message });

        const result = await createForumTopic({
          title: data.title,
          content: data.content,
          categoryId: data.categoryId,
          address,
          signature,
          message,
        });

        if (!result.success || !result.topic || !result.post) {
          throw new Error(result.error || "Failed to create topic");
        }

        let attachments: any[] = [];

        if (data.attachment) {
          try {
            const attachmentData = await convertFileToAttachmentData(
              data.attachment
            );

            const attachmentResult = await uploadAttachment(
              attachmentData,
              address,
              "topic",
              result.topic.id
            );

            if (
              !attachmentResult ||
              !attachmentResult.success ||
              !attachmentResult.attachment
            ) {
              throw new Error(
                attachmentResult?.error || "Failed to upload attachment"
              );
            }

            attachments = [
              {
                id: attachmentResult.attachment.id,
                fileName: attachmentResult.attachment.fileName,
                contentType: attachmentResult.attachment.contentType,
                fileSize: attachmentResult.attachment.fileSize,
                ipfsCid: attachmentResult.attachment.ipfsCid,
                url: attachmentResult.attachment.ipfsUrl,
                createdAt: attachmentResult.attachment.createdAt,
              },
            ];
          } catch (attachmentError) {
            try {
              await deleteForumTopic({
                topicId: result.topic.id,
                _internal: true,
              });
            } catch (cleanupError) {
              console.error(
                "Failed to clean up topic after attachment error:",
                cleanupError
              );
            }
            throw attachmentError;
          }
        }

        return {
          id: result.topic.id,
          title: result.topic.title,
          author: result.topic.address,
          content: result.post.content,
          createdAt: result.topic.createdAt,
          comments: [],
          attachments,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create topic";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
        toast.dismiss(toastId);
      }
    },
    [isConnected, address, signMessageAsync]
  );

  const createPost = useCallback(
    async (
      topicId: number,
      data: CreatePostData
    ): Promise<ForumPost | null> => {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first");
      }

      setLoading(true);
      const toastId = toast.loading("Creating post...");
      setError(null);

      try {
        const message = `Create forum post: ${data.content}\nTopic ID: ${topicId}\nTimestamp: ${Date.now()}`;

        const signature = await signMessageAsync({ message });

        const result = await createForumPost(topicId, {
          content: data.content,
          parentId: data.parentId,
          address,
          signature,
          message,
        });

        if (!result.success || !result.post) {
          throw new Error(result.error || "Failed to create post");
        }

        if (data.attachment) {
          try {
            const attachmentData = await convertFileToAttachmentData(
              data.attachment
            );

            const attachmentResult = await uploadAttachment(
              attachmentData,
              address,
              "post",
              result.post.id
            );

            if (attachmentResult && attachmentResult.success) {
            } else {
              console.error(
                "Failed to upload attachment:",
                attachmentResult?.error || "No result returned"
              );
              toast.error(
                `Post created but attachment failed: ${attachmentResult?.error || "Upload function returned no result"}`
              );
            }
          } catch (attachmentError) {
            console.error("Attachment upload threw an error:", attachmentError);
            toast.error(
              `Post created but attachment failed: ${attachmentError instanceof Error ? attachmentError.message : "Unknown error"}`
            );
          }
        }

        return {
          id: result.post.id,
          author: result.post.address,
          content: result.post.content,
          createdAt: result.post.createdAt,
          parentId: result.post.parentPostId || undefined,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create post";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
        toast.dismiss(toastId);
      }
    },
    [isConnected, address, signMessageAsync]
  );

  const fetchDocuments = useCallback(async (): Promise<ForumDocument[]> => {
    setLoading(true);
    setError(null);

    try {
      const result = await getForumAttachments({});

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch documents"
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(
    async (attachmentData: AttachmentData): Promise<ForumDocument | null> => {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first");
      }

      setLoading(true);
      const toastId = toast.loading("Uploading document...");
      setError(null);

      try {
        const message = `Upload forum document: ${attachmentData.fileName}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        const result = await uploadDocumentFromBase64(
          attachmentData,
          address,
          signature,
          message
        );

        if (!result.success) {
          throw new Error(result.error || "Failed to save document");
        }

        const successResult = result as { success: true; document: any };
        if (!successResult.document) {
          throw new Error("No document returned from upload");
        }

        return {
          id: successResult.document.id,
          name: successResult.document.name,
          url: successResult.document.url,
          ipfsCid: successResult.document.ipfsCid,
          createdAt: successResult.document.createdAt,
          uploadedBy: successResult.document.uploadedBy,
        };
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to upload document"
        );
        return null;
      } finally {
        setLoading(false);
        toast.dismiss(toastId);
      }
    },
    [isConnected, address, signMessageAsync]
  );

  const deleteTopic = useCallback(
    async (topicId: number): Promise<boolean> => {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first");
      }

      setLoading(true);
      const toastId = toast.loading("Deleting topic...");
      setError(null);

      try {
        const message = `Delete forum topic: ${topicId}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        const result = await deleteForumTopic({
          topicId,
          address,
          signature,
          message,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success("Topic deleted successfully!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete topic";
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
        toast.dismiss(toastId);
      }
    },
    [isConnected, address, signMessageAsync]
  );

  const deletePost = useCallback(
    async (postId: number): Promise<boolean> => {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first");
      }

      setLoading(true);
      const toastId = toast.loading("Deleting post...");
      setError(null);

      try {
        const message = `Delete forum post: ${postId}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        const result = await deleteForumPost({
          postId,
          address,
          signature,
          message,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success("Post deleted successfully!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete post";
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
        toast.dismiss(toastId);
      }
    },
    [isConnected, address, signMessageAsync]
  );

  const deleteAttachment = useCallback(
    async (attachmentId: number): Promise<boolean> => {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first");
      }

      setLoading(true);
      const toastId = toast.loading("Deleting attachment...");
      setError(null);

      try {
        const message = `Delete forum attachment: ${attachmentId}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        const result = await deleteForumAttachment({
          attachmentId,
          address,
          signature,
          message,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success("Attachment deleted successfully!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete document";
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
        toast.dismiss(toastId);
      }
    },
    [isConnected, address, signMessageAsync]
  );

  const archiveTopic = useCallback(
    async (topicId: number): Promise<boolean> => {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first");
      }

      setLoading(true);
      const toastId = toast.loading("Archiving topic...");
      setError(null);

      try {
        const message = `Archive forum topic: ${topicId}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        const result = await archiveForumTopic({
          topicId,
          address,
          signature,
          message,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success("Topic archived successfully!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to archive topic";
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
        toast.dismiss(toastId);
      }
    },
    [isConnected, address, signMessageAsync]
  );

  const archiveAttachment = useCallback(
    async (attachmentId: number): Promise<boolean> => {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first");
      }

      setLoading(true);
      const toastId = toast.loading("Archiving attachment...");
      setError(null);

      try {
        const message = `Archive forum attachment: ${attachmentId}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        const result = await archiveForumAttachment({
          attachmentId,
          address,
          signature,
          message,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success("Attachment archived successfully!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to archive attachment";
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
        toast.dismiss(toastId);
      }
    },
    [isConnected, address, signMessageAsync]
  );

  const fetchCategories = useCallback(async (): Promise<ForumCategory[]> => {
    setLoading(true);
    setError(null);

    try {
      const result = await getForumCategories();

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description || undefined,
        archived: category.archived,
        adminOnlyTopics: category.adminOnlyTopics,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch categories"
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchArchivedTopics = useCallback(
    async (categoryId?: number): Promise<ForumTopic[]> => {
      setLoading(true);
      setError(null);

      try {
        const result = await getArchivedForumTopics(categoryId);

        if (!result.success) {
          throw new Error(result.error);
        }

        const transformedTopics = transformForumTopics(result.data);

        return transformedTopics;
      } catch (err) {
        console.error("Error fetching archived topics:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch archived topics"
        );
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchArchivedDocuments = useCallback(async (): Promise<
    ForumDocument[]
  > => {
    setLoading(true);
    setError(null);

    try {
      const result = await getArchivedForumAttachments();

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch archived documents"
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchArchivedCategories = useCallback(async (): Promise<
    ForumCategory[]
  > => {
    setLoading(true);
    setError(null);

    try {
      const result = await getArchivedForumCategories();

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description || undefined,
        archived: category.archived,
        adminOnlyTopics: category.adminOnlyTopics,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch archived categories"
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const unarchiveTopic = useCallback(
    async (topicId: number): Promise<boolean> => {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first");
      }

      setLoading(true);
      const toastId = toast.loading("Unarchiving topic...");
      setError(null);

      try {
        const message = `Unarchive forum topic: ${topicId}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        const result = await unarchiveForumTopic({
          topicId,
          address,
          signature,
          message,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success("Topic unarchived successfully!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to unarchive topic";
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
        toast.dismiss(toastId);
      }
    },
    [isConnected, address, signMessageAsync]
  );

  const unarchiveAttachment = useCallback(
    async (attachmentId: number): Promise<boolean> => {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first");
      }

      setLoading(true);
      const toastId = toast.loading("Unarchiving attachment...");
      setError(null);

      try {
        const message = `Unarchive forum attachment: ${attachmentId}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        const result = await unarchiveForumAttachment({
          attachmentId,
          address,
          signature,
          message,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success("Attachment unarchived successfully!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to unarchive attachment";
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
        toast.dismiss(toastId);
      }
    },
    [isConnected, address, signMessageAsync]
  );

  const unarchiveCategory = useCallback(
    async (categoryId: number): Promise<boolean> => {
      if (!isConnected || !address) {
        toast.error("Please connect your wallet first");
        return false;
      }

      setLoading(true);
      const toastId = toast.loading("Unarchiving category...");
      setError(null);

      try {
        const message = `Unarchive forum category: ${categoryId}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        const result = await unarchiveForumCategory({
          categoryId,
          adminAddress: address,
          signature,
          message,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success("Category unarchived successfully!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to unarchive category";
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
        toast.dismiss(toastId);
      }
    },
    [isConnected, address, signMessageAsync]
  );

  const createCategory = useCallback(
    async (data: {
      name: string;
      description?: string;
      adminOnlyTopics?: boolean;
    }): Promise<ForumCategory | null> => {
      if (!isConnected || !address) {
        toast.error("Please connect your wallet first");
        return null;
      }

      setLoading(true);
      const toastId = toast.loading("Creating category...");
      setError(null);

      try {
        const message = `Create forum category: ${data.name}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        const result = await createForumCategory({
          name: data.name,
          description: data.description,
          adminOnlyTopics: data.adminOnlyTopics || false,
          adminAddress: address,
          signature,
          message,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        if (!result.data) {
          throw new Error("Category data is missing from response");
        }

        toast.success("Category created successfully!");
        return {
          id: result.data.id,
          name: result.data.name,
          description: result.data.description || undefined,
          archived: result.data.archived,
          adminOnlyTopics: result.data.adminOnlyTopics,
          createdAt: result.data.createdAt.toISOString(),
          updatedAt: result.data.updatedAt.toISOString(),
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create category";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
        toast.dismiss(toastId);
      }
    },
    [isConnected, address, signMessageAsync]
  );

  const updateCategory = useCallback(
    async (
      categoryId: number,
      data: {
        name?: string;
        description?: string;
        adminOnlyTopics?: boolean;
      }
    ): Promise<ForumCategory | null> => {
      if (!isConnected || !address) {
        toast.error("Please connect your wallet first");
        return null;
      }

      setLoading(true);
      const toastId = toast.loading("Updating category...");
      setError(null);

      try {
        const message = `Update forum category: ${categoryId}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        const result = await updateForumCategory({
          categoryId,
          name: data.name,
          description: data.description,
          adminOnlyTopics: data.adminOnlyTopics,
          adminAddress: address,
          signature,
          message,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        if (!result.data) {
          throw new Error("Category data is missing from response");
        }

        toast.success("Category updated successfully!");
        return {
          id: result.data.id,
          name: result.data.name,
          description: result.data.description || undefined,
          archived: result.data.archived,
          adminOnlyTopics: result.data.adminOnlyTopics,
          createdAt: result.data.createdAt.toISOString(),
          updatedAt: result.data.updatedAt.toISOString(),
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update category";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
        toast.dismiss(toastId);
      }
    },
    [isConnected, address, signMessageAsync]
  );

  const deleteCategory = useCallback(
    async (categoryId: number): Promise<boolean> => {
      if (!isConnected || !address) {
        toast.error("Please connect your wallet first");
        return false;
      }

      setLoading(true);
      const toastId = toast.loading("Deleting category...");
      setError(null);

      try {
        const message = `Delete forum category: ${categoryId}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        const result = await deleteForumCategory({
          categoryId,
          adminAddress: address,
          signature,
          message,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success("Category deleted successfully!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete category";
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
        toast.dismiss(toastId);
      }
    },
    [isConnected, address, signMessageAsync]
  );

  const archiveCategory = useCallback(
    async (categoryId: number): Promise<boolean> => {
      if (!isConnected || !address) {
        toast.error("Please connect your wallet first");
        return false;
      }

      setLoading(true);
      const toastId = toast.loading("Archiving category...");
      setError(null);

      try {
        const message = `Archive forum category: ${categoryId}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        const result = await archiveForumCategory({
          categoryId,
          adminAddress: address,
          signature,
          message,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success("Category archived successfully!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to archive category";
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
        toast.dismiss(toastId);
      }
    },
    [isConnected, address, signMessageAsync]
  );

  return {
    loading,
    error,
    isAuthenticated: true,
    fetchTopics,
    fetchTopic,
    createTopic,
    createPost,
    deleteTopic,
    deletePost,
    deleteAttachment,
    fetchDocuments,
    uploadDocument,
    archiveTopic,
    archiveAttachment,
    fetchCategories,
    fetchArchivedTopics,
    fetchArchivedDocuments,
    fetchArchivedCategories,
    unarchiveTopic,
    unarchiveAttachment,
    unarchiveCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    archiveCategory,
  };
};

export const useForumAdmin = (categoryId?: number) => {
  const { address } = useAccount();

  const { data, isLoading } = useQuery({
    queryKey: ["forum-admin", categoryId, address],
    queryFn: () => checkForumPermissions(address || "", categoryId),
  });

  return {
    isAdmin: !!data?.isAdmin,
    canCreateTopics: !!data?.canCreateTopics,
    canManageTopics: !!data?.canManageTopics,
    canCreateAttachments: !!data?.canCreateAttachments,
    canManageAttachments: !!data?.canManageAttachments,
    isLoading,
  };
};
