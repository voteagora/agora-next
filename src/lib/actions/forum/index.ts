// Topics
export {
  getForumTopics,
  getForumTopic,
  getForumTopicsByUser,
  createForumTopic,
  deleteForumTopic,
  deleteForumTopicWithAuth,
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
  getMyVotesForTopics,
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
  uploadDocumentFromBase64,
  deleteForumAttachment,
  archiveForumAttachment,
  getForumCategoryAttachments,
} from "./attachments";

// Analytics
export { trackForumView, getForumViewStats } from "./analytics";

// Subscriptions
export {
  subscribeToForumContent,
  unsubscribeFromForumContent,
  getForumSubscriptions,
} from "./subscriptions";

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

export {
  forumSurveyKindSchema,
  forumSurveyQuestionTypeSchema,
  surveyQuestionSchema,
  surveyDefinitionSchema,
  surveyAnswerInputSchema,
  surveySubmissionSchema,
  closeForumSurveySchema,
} from "./surveySchemas";
export type {
  SurveyQuestionInput,
  SurveyDefinitionInput,
  SurveyAnswerInput,
  SurveySubmissionInput,
  SurveyViewerInput,
  CloseForumSurveyInput,
} from "./surveySchemas";
export type {
  ForumSurveyStatus,
  ForumSurveyErrorCode,
  ForumSurveyAnswerDto,
  ForumSurveyViewerResponseDto,
  ForumSurveyViewerDto,
  ForumSurveyOptionDto,
  ForumSurveyQuestionDto,
  ForumSurveyRespondentDto,
  ForumSurveyDto,
  ForumSurveySummaryDto,
  ForumSurveyActionResult,
} from "./surveyTypes";
export {
  getForumSurvey,
  getForumSurveyByTopic,
  getForumSurveyByKey,
  getForumSurveyViewerState,
  submitForumSurvey,
  submitForumSurveyResponse,
  closeForumSurvey,
} from "./surveys";

// Admin
export {
  getForumAdmins,
  checkForumPermissions,
  logForumAuditAction,
} from "./admin";

// Reactions
export { addForumReaction, removeForumReaction } from "./reactions";
