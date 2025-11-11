// Topics
export {
  getForumTopics,
  getForumTopic,
  getForumTopicsByUser,
  createForumTopic,
  deleteForumTopic,
  softDeleteForumTopic,
  restoreForumTopic,
  archiveForumTopic,
  getForumData,
  getForumTopicsCount,
  getUncategorizedTopicsCount,
} from "./topics";

// Posts
export {
  upvoteForumTopic,
  removeUpvoteForumTopic,
  getForumTopicUpvotes,
  getMyForumTopicVote,
  createForumPost,
  deleteForumPost,
  softDeleteForumPost,
  restoreForumPost,
  getForumPostsByTopic,
  getForumPost,
  getLatestForumPost,
  getForumPostsByUser,
} from "./posts";

// Categories
export {
  getForumCategories,
  getForumCategory,
  getDunaCategoryId,
} from "./categories";

// Attachments
export {
  getForumAttachments,
  uploadFileToIPFS,
  uploadDocumentFromBase64,
  deleteForumAttachment,
  archiveForumAttachment,
  getForumCategoryAttachments,
} from "./attachments";

// Analytics
export {
  trackForumView,
  getForumViewStats,
  subscribeToForumContent,
  unsubscribeFromForumContent,
  getForumSubscriptions,
} from "./analytics";

// Search
export {
  indexForumTopic,
  indexForumPost,
  removeForumTopicFromIndex,
  removeForumPostFromIndex,
} from "./search";

// Shared (schemas and utilities)
export {
  createTopicSchema,
  createPostSchema,
  uploadDocumentSchema,
  deleteTopicSchema,
  deletePostSchema,
  softDeleteTopicSchema,
  softDeletePostSchema,
  archiveTopicSchema,
  archiveAttachmentSchema,
  handlePrismaError,
} from "./shared";

// Admin
export {
  getForumAdmins,
  checkForumPermissions,
  logForumAuditAction,
} from "./admin";

// Reactions
export { addForumReaction, removeForumReaction } from "./reactions";
