import { useState, useCallback } from "react";
import { useAccount, useSignMessage } from "wagmi";
import {
  getForumTopics,
  getForumTopic,
  createForumTopic,
  createForumPost,
  getForumDocuments,
  uploadDocumentFromBase64,
} from "@/lib/actions/forum";
import { uploadAttachment } from "@/lib/actions/attachment";
import { convertFileToAttachmentData, AttachmentData } from "@/lib/fileUtils";
import toast from "react-hot-toast";

interface ForumTopic {
  id: number;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  comments: ForumPost[];
  attachments: any[];
}

interface ForumPost {
  id: number;
  author: string;
  content: string;
  createdAt: string;
  parentId?: number;
}

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

        const transformedTopics = result.data.map((topic: any) => ({
          id: topic.id,
          title: topic.title,
          author: topic.address,
          content: topic.posts?.[0]?.content || "",
          createdAt: topic.createdAt,
          comments: topic.posts?.slice(1) || [],
          attachments: topic.attachments || [],
        }));

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

      setLoading(true);
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
              attachmentResult &&
              attachmentResult.success &&
              attachmentResult.attachment
            ) {
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
            } else {
              console.error(
                "Failed to upload attachment:",
                attachmentResult?.error || "No result returned"
              );
              toast.error(
                `Topic created but attachment failed: ${attachmentResult?.error || "Upload function returned no result"}`
              );
            }
          } catch (attachmentError) {
            console.error("Attachment upload threw an error:", attachmentError);
            toast.error(
              `Topic created but attachment failed: ${attachmentError instanceof Error ? attachmentError.message : "Unknown error"}`
            );
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
      }
    },
    [isConnected, address, signMessageAsync]
  );

  const fetchDocuments = useCallback(async (): Promise<ForumDocument[]> => {
    setLoading(true);
    setError(null);

    try {
      const result = await getForumDocuments();

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
      setLoading(true);
      setError(null);

      try {
        const result = await uploadDocumentFromBase64(attachmentData);

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
      }
    },
    []
  );

  return {
    loading,
    error,
    isAuthenticated: true,
    fetchTopics,
    fetchTopic,
    createTopic,
    createPost,
    fetchDocuments,
    uploadDocument,
  };
};
