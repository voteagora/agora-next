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
  checkForumPermissions,
  softDeleteForumTopic,
  softDeleteForumPost,
  restoreForumTopic,
  restoreForumPost,
} from "@/lib/actions/forum";
import { addForumReaction, removeForumReaction } from "@/lib/actions/forum";
import {
  upvoteForumTopic,
  removeUpvoteForumTopic,
  getForumTopicUpvotes,
  getMyForumTopicVote,
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
import { getForumAdmins } from "@/lib/actions/forum/admin";

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
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const fetchTopics = useCallback(
    async (categoryId?: number): Promise<ForumTopic[]> => {
      setLoading(true);
      setError(null);

      try {
        const result = await getForumTopics({ categoryId });

        if (!result.success) {
          throw new Error(
            "error" in result ? result.error : "Failed to fetch topics"
          );
        }

        if (!("data" in result)) {
          throw new Error("No data received");
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

        if (!result.success) {
          throw new Error(result.error);
        }

        const topic: any = result.data;

        if (!topic) {
          throw new Error("No topic data received");
        }

        return {
          id: topic.id,
          title: topic.title,
          author: topic.address,
          content: topic.posts?.[0]?.content || "",
          createdAt: (topic.createdAt instanceof Date
            ? topic.createdAt
            : new Date(topic.createdAt)
          ).toISOString(),
          comments:
            topic.posts?.slice(1).map((post: any) => ({
              id: post.id,
              author: post.address,
              content: post.content,
              createdAt: (post.createdAt instanceof Date
                ? post.createdAt
                : new Date(post.createdAt)
              ).toISOString(),
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
      const currentAddress = address!;

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
          address: currentAddress,
          signature,
          message,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        let attachments: any[] = [];

        if (data.attachment) {
          try {
            const attachmentData = await convertFileToAttachmentData(
              data.attachment
            );

            const attachmentResult = await uploadAttachment(
              attachmentData,
              currentAddress,
              "post",
              result.data?.post.id!
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
                topicId: result.data?.topic.id!,
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

        if (!result.data) {
          throw new Error("No data received from topic creation");
        }

        return {
          id: result.data.topic.id,
          title: result.data.topic.title,
          author: result.data.topic.address,
          content: result.data.post.content,
          createdAt: result.data.topic.createdAt,
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
    [address, signMessageAsync]
  );

  const createPost = useCallback(
    async (
      topicId: number,
      data: CreatePostData
    ): Promise<ForumPost | null> => {
      const currentAddress = address!;

      setLoading(true);
      const toastId = toast.loading("Creating post...");
      setError(null);

      try {
        const message = `Create forum post: ${data.content}\nTopic ID: ${topicId}\nTimestamp: ${Date.now()}`;

        const signature = await signMessageAsync({ message });

        const result = await createForumPost(topicId, {
          content: data.content,
          parentId: data.parentId,
          address: currentAddress,
          signature,
          message,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        if (data.attachment) {
          try {
            const attachmentData = await convertFileToAttachmentData(
              data.attachment
            );

            const attachmentResult = await uploadAttachment(
              attachmentData,
              currentAddress,
              "post",
              result.data?.id!
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

        if (!result.data) {
          throw new Error("No data received from post creation");
        }

        return {
          id: result.data.id,
          author: result.data.address,
          content: result.data.content,
          createdAt: result.data.createdAt,
          parentId: result.data.parentPostId || undefined,
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
    [address, signMessageAsync]
  );

  const fetchDocuments = useCallback(async (): Promise<ForumDocument[]> => {
    setLoading(true);
    setError(null);

    try {
      const result = await getForumAttachments();

      if (!result.success) {
        throw new Error(
          "error" in result ? result.error : "Failed to fetch attachments"
        );
      }

      if (!("data" in result)) {
        throw new Error("No data received");
      }

      return result.data.map((doc: any) => ({
        ...doc,
        name: doc.name || "",
        uploadedBy: doc.uploadedBy || "",
      }));
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
    async (
      attachmentData: AttachmentData,
      categoryId: number
    ): Promise<ForumDocument | null> => {
      const currentAddress = address!;

      setLoading(true);
      const toastId = toast.loading("Uploading document...");
      setError(null);

      try {
        const message = `Upload forum document: ${attachmentData.fileName}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        const result = await uploadDocumentFromBase64(
          attachmentData.base64Data,
          attachmentData.fileName,
          attachmentData.contentType,
          currentAddress,
          signature,
          message,
          categoryId
        );

        if (!result.success) {
          throw new Error(result.error || "Failed to save document");
        }

        if (!("data" in result) || !result.data) {
          throw new Error("No document returned from upload");
        }

        return {
          id: result.data.id,
          name: result.data.name || "",
          url: result.data.url,
          ipfsCid: result.data.ipfsCid,
          createdAt: result.data.createdAt,
          uploadedBy: result.data.uploadedBy || "",
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
    [address, signMessageAsync]
  );

  const deleteTopic = useCallback(
    async (topicId: number, isAdmin: boolean = false): Promise<boolean> => {
      const currentAddress = address!;

      setLoading(true);
      const toastId = toast.loading("Deleting topic...");
      setError(null);

      try {
        const message = `Delete forum topic: ${topicId}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        let result;
        if (isAdmin) {
          result = await deleteForumTopic({
            topicId,
            address: currentAddress,
            signature,
            message,
          });
        } else {
          result = await softDeleteForumTopic({
            topicId,
            address: currentAddress,
            signature,
            message,
          });
        }

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
    [address, signMessageAsync]
  );

  const deletePost = useCallback(
    async (postId: number, isAdmin: boolean = false): Promise<boolean> => {
      const currentAddress = address!;

      setLoading(true);
      const toastId = toast.loading("Deleting post...");
      setError(null);

      try {
        const message = `Delete forum post: ${postId}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        let result;
        if (isAdmin) {
          result = await deleteForumPost({
            postId,
            address: currentAddress,
            signature,
            message,
          });
        } else {
          result = await softDeleteForumPost({
            postId,
            address: currentAddress,
            signature,
            message,
          });
        }

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
    [address, signMessageAsync]
  );

  const deleteAttachment = useCallback(
    async (
      attachmentId: number,
      targetType: "post" | "category",
      isAuthor: boolean = true
    ): Promise<boolean> => {
      const currentAddress = address!;

      setLoading(true);
      const toastId = toast.loading("Deleting attachment...");
      setError(null);

      try {
        const message = `Delete forum attachment: ${attachmentId}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        const result = await deleteForumAttachment({
          attachmentId,
          targetType,
          address: currentAddress,
          isAuthor,
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
    [address, signMessageAsync]
  );

  const archiveTopic = useCallback(
    async (topicId: number, isAuthor: boolean = true): Promise<boolean> => {
      const currentAddress = address!;

      setLoading(true);
      const toastId = toast.loading("Archiving topic...");
      setError(null);

      try {
        const message = `Archive forum topic: ${topicId}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        const result = await archiveForumTopic({
          topicId,
          address: currentAddress,
          signature,
          message,
          isAuthor,
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
    [address, signMessageAsync]
  );

  const archiveAttachment = useCallback(
    async (
      attachmentId: number,
      targetType: "post" | "category",
      isAuthor: boolean = true
    ): Promise<boolean> => {
      const currentAddress = address!;

      setLoading(true);
      const toastId = toast.loading("Archiving attachment...");
      setError(null);

      try {
        const message = `Archive forum attachment: ${attachmentId}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        const result = await archiveForumAttachment({
          attachmentId,
          targetType,
          address: currentAddress,
          isAuthor,
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
    [address, signMessageAsync]
  );

  const fetchCategories = useCallback(async (): Promise<ForumCategory[]> => {
    setLoading(true);
    setError(null);

    try {
      const result = await getForumCategories();

      if (!result.success) {
        throw new Error(
          "error" in result ? result.error : "Failed to fetch categories"
        );
      }

      if (!("data" in result)) {
        throw new Error("No data received");
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

  const restoreTopic = useCallback(
    async (topicId: number, isAuthor: boolean = true): Promise<boolean> => {
      const currentAddress = address!;

      setLoading(true);
      const toastId = toast.loading("Restoring topic...");
      setError(null);

      try {
        const message = `Restore forum topic: ${topicId}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        const result = await restoreForumTopic({
          topicId,
          address: currentAddress,
          signature,
          message,
          isAuthor,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success("Topic restored successfully!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to restore topic";
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
        toast.dismiss(toastId);
      }
    },
    [address, signMessageAsync]
  );

  const restorePost = useCallback(
    async (postId: number, isAuthor: boolean = true): Promise<boolean> => {
      const currentAddress = address!;

      setLoading(true);
      const toastId = toast.loading("Restoring post...");
      setError(null);

      try {
        const message = `Restore forum post: ${postId}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        const result = await restoreForumPost({
          postId,
          address: currentAddress,
          signature,
          message,
          isAuthor,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success("Post restored successfully!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to restore post";
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
        toast.dismiss(toastId);
      }
    },
    [address, signMessageAsync]
  );

  const addReaction = useCallback(
    async (
      targetType: "topic" | "post",
      targetId: number,
      emoji: string
    ): Promise<boolean> => {
      const currentAddress = address!;
      try {
        const message = `Add forum reaction: ${emoji} to ${targetType}:${targetId}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });
        const res = await addForumReaction({
          // Only post reactions supported by schema
          targetType: "post",
          targetId,
          emoji,
          address: currentAddress,
          signature,
          message,
        });
        if (!res.success)
          throw new Error(res.error || "Failed to add reaction");
        return true;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to add reaction";
        setError(msg);
        toast.error(msg);
        return false;
      }
    },
    [address, signMessageAsync]
  );

  const removeReaction = useCallback(
    async (
      targetType: "topic" | "post",
      targetId: number,
      emoji: string
    ): Promise<boolean> => {
      const currentAddress = address!;
      try {
        const message = `Remove forum reaction: ${emoji} from ${targetType}:${targetId}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });
        const res = await removeForumReaction({
          targetType: "post",
          targetId,
          emoji,
          address: currentAddress,
          signature,
          message,
        });
        if (!res.success)
          throw new Error(res.error || "Failed to remove reaction");
        return true;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to remove reaction";
        setError(msg);
        toast.error(msg);
        return false;
      }
    },
    [address, signMessageAsync]
  );

  const upvoteTopic = useCallback(
    async (topicId: number): Promise<number | null> => {
      const currentAddress = address!;
      try {
        const message = `Upvote forum topic: ${topicId}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });
        const res = await upvoteForumTopic({
          topicId,
          address: currentAddress,
          signature,
          message,
        });
        if (!res.success) throw new Error(res.error || "Failed to upvote");
        return res.data?.upvotes ?? null;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to upvote";
        setError(msg);
        toast.error(msg);
        return null;
      }
    },
    [address, signMessageAsync]
  );

  const removeUpvoteTopic = useCallback(
    async (topicId: number): Promise<number | null> => {
      const currentAddress = address!;
      try {
        const message = `Remove upvote forum topic: ${topicId}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });
        const res = await removeUpvoteForumTopic({
          topicId,
          address: currentAddress,
          signature,
          message,
        });
        if (!res.success)
          throw new Error(res.error || "Failed to remove upvote");
        return res.data?.upvotes ?? null;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to remove upvote";
        setError(msg);
        toast.error(msg);
        return null;
      }
    },
    [address, signMessageAsync]
  );

  const fetchTopicUpvotes = useCallback(async (topicId: number) => {
    try {
      const res = await getForumTopicUpvotes(topicId);
      if (!res.success) throw new Error(res.error || "Failed to fetch upvotes");
      return res.data?.upvotes ?? 0;
    } catch (err) {
      return 0;
    }
  }, []);

  const hasUpvotedTopic = useCallback(
    async (topicId: number): Promise<boolean> => {
      if (!address) return false;
      try {
        const res = await getMyForumTopicVote(topicId, address);
        return !!res.success && !!res.data?.hasVoted;
      } catch {
        return false;
      }
    },
    [address]
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
    fetchCategories,
    archiveTopic,
    archiveAttachment,
    restoreTopic,
    restorePost,
    addReaction,
    removeReaction,
    upvoteTopic,
    removeUpvoteTopic,
    fetchTopicUpvotes,
    hasUpvotedTopic,
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

export const useForumAdminsList = () => {
  const query = useQuery({
    queryKey: ["forum-admins-list"],
    queryFn: async () => {
      const res = await getForumAdmins();
      if (!res.success) {
        throw new Error(res.error || "Failed to load forum admins");
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    admins: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error : undefined,
    refetch: query.refetch,
  };
};
