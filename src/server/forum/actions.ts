import { createServerFn } from "@tanstack/react-start";

import type {
  archiveForumAttachment as _ArchiveForumAttachment,
  archiveForumTopic as _ArchiveForumTopic,
  checkForumPermissions as _CheckForumPermissions,
  createForumPost as _CreateForumPost,
  createForumTopic as _CreateForumTopic,
  deleteForumAttachment as _DeleteForumAttachment,
  deleteForumPost as _DeleteForumPost,
  deleteForumTopic as _DeleteForumTopic,
  deleteForumTopicWithAuth as _DeleteForumTopicWithAuth,
  getForumAttachments as _GetForumAttachments,
  getForumCategories as _GetForumCategories,
  getForumTopic as _GetForumTopic,
  getForumTopicUpvotes as _GetForumTopicUpvotes,
  getForumTopics as _GetForumTopics,
  getForumTopicsByUser as _GetForumTopicsByUser,
  getForumPostsByUser as _GetForumPostsByUser,
  getForumSubscriptions as _GetForumSubscriptions,
  getMyForumTopicVote as _GetMyForumTopicVote,
  getMyVotesForTopics as _GetMyVotesForTopics,
  getDunaCategoryId as _GetDunaCategoryId,
  removeForumReaction as _RemoveForumReaction,
  removeUpvoteForumTopic as _RemoveUpvoteForumTopic,
  restoreForumPost as _RestoreForumPost,
  restoreForumTopic as _RestoreForumTopic,
  softDeleteForumPost as _SoftDeleteForumPost,
  softDeleteForumTopic as _SoftDeleteForumTopic,
  subscribeToForumContent as _SubscribeToForumContent,
  unsubscribeFromForumContent as _UnsubscribeFromForumContent,
  upvoteForumTopic as _UpvoteForumTopic,
  uploadDocumentFromBase64 as _UploadDocumentFromBase64,
  addForumReaction as _AddForumReaction,
} from "@/lib/actions/forum";
import type { getForumAdmins as _GetForumAdmins } from "@/lib/actions/forum/admin";
import type { trackForumView as _TrackForumView } from "@/lib/actions/forum/analytics";
import type { uploadAttachment as _UploadAttachment } from "@/lib/actions/attachment";
import type { uploadToIPFSOnly as _UploadToIPFSOnly } from "@/lib/actions/attachment";
import type { createDiscussionProposalLink as _CreateDiscussionProposalLink } from "@/lib/actions/proposalLinks";
import type {
  getForumTopicTempChecks as _GetForumTopicTempChecks,
  getProposalLinks as _GetProposalLinks,
} from "@/lib/actions/proposalLinks";
import type { getProposalLinksWithDetails as _GetProposalLinksWithDetails } from "@/lib/actions/proposalLinksWithDetails";
import type { getArchivedProposals as _GetArchivedProposals } from "@/lib/actions/archive";

const serverForumAction = createServerFn({ method: "POST" })
  .inputValidator((data: { action: string; args: unknown[] }) => data)
  .handler(async ({ data }): Promise<any> => {
    const forum = await import("@/lib/actions/forum");
    const fn = (
      forum as unknown as Record<string, (...args: unknown[]) => any>
    )[data.action];

    if (typeof fn !== "function") {
      throw new Error(`Unknown forum action: ${data.action}`);
    }

    return fn(...data.args);
  });

const serverGetForumAdmins = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getForumAdmins } = await import("@/lib/actions/forum/admin");
    return getForumAdmins();
  }
);

const serverTrackForumView = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }): Promise<any> => {
    const { trackForumView } = await import("@/lib/actions/forum/analytics");
    return trackForumView(data);
  });

const serverUploadAttachment = createServerFn({ method: "POST" })
  .inputValidator((data: { args: unknown[] }) => data)
  .handler(async ({ data }): Promise<any> => {
    const { uploadAttachment } = await import("@/lib/actions/attachment");
    return (uploadAttachment as any)(...data.args);
  });

const serverUploadToIPFSOnly = createServerFn({ method: "POST" })
  .inputValidator((data: { args: unknown[] }) => data)
  .handler(async ({ data }): Promise<any> => {
    const { uploadToIPFSOnly } = await import("@/lib/actions/attachment");
    return (uploadToIPFSOnly as any)(...data.args);
  });

const serverCreateDiscussionProposalLink = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }): Promise<any> => {
    const { createDiscussionProposalLink } = await import(
      "@/lib/actions/proposalLinks"
    );
    return createDiscussionProposalLink(data);
  });

const serverGetForumTopicTempChecks = createServerFn({ method: "GET" })
  .inputValidator((data: { topicId: string }) => data)
  .handler(async ({ data }) => {
    const { getForumTopicTempChecks } = await import(
      "@/lib/actions/proposalLinks"
    );
    return getForumTopicTempChecks(data.topicId);
  });

const serverGetProposalLinks = createServerFn({ method: "GET" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }): Promise<any> => {
    const { getProposalLinks } = await import("@/lib/actions/proposalLinks");
    return getProposalLinks(data);
  });

const serverGetArchivedProposals = createServerFn({ method: "GET" })
  .inputValidator((data: { filter?: string }) => data)
  .handler(async ({ data }): Promise<any> => {
    const { getArchivedProposals } = await import("@/lib/actions/archive");
    return getArchivedProposals(data.filter);
  });

const serverGetProposalLinksWithDetails = createServerFn({ method: "GET" })
  .inputValidator((data: { proposalId: string }) => data)
  .handler(async ({ data }) => {
    const { getProposalLinksWithDetails } = await import(
      "@/lib/actions/proposalLinksWithDetails"
    );
    return getProposalLinksWithDetails(data.proposalId);
  });

const callForumAction = (action: string, args: unknown[]) =>
  serverForumAction({ data: { action, args } }) as any;

export const getForumTopics: typeof _GetForumTopics = (...args) =>
  callForumAction("getForumTopics", args);
export const getForumTopic: typeof _GetForumTopic = (...args) =>
  callForumAction("getForumTopic", args);
export const getForumTopicsByUser: typeof _GetForumTopicsByUser = (...args) =>
  callForumAction("getForumTopicsByUser", args);
export const getForumPostsByUser: typeof _GetForumPostsByUser = (...args) =>
  callForumAction("getForumPostsByUser", args);
export const createForumTopic: typeof _CreateForumTopic = (...args) =>
  callForumAction("createForumTopic", args);
export const createForumPost: typeof _CreateForumPost = (...args) =>
  callForumAction("createForumPost", args);
export const deleteForumTopic: typeof _DeleteForumTopic = (...args) =>
  callForumAction("deleteForumTopic", args);
export const deleteForumTopicWithAuth: typeof _DeleteForumTopicWithAuth = (
  ...args
) => callForumAction("deleteForumTopicWithAuth", args);
export const deleteForumPost: typeof _DeleteForumPost = (...args) =>
  callForumAction("deleteForumPost", args);
export const deleteForumAttachment: typeof _DeleteForumAttachment = (...args) =>
  callForumAction("deleteForumAttachment", args);
export const getForumAttachments: typeof _GetForumAttachments = (...args) =>
  callForumAction("getForumAttachments", args);
export const uploadDocumentFromBase64: typeof _UploadDocumentFromBase64 = (
  ...args
) => callForumAction("uploadDocumentFromBase64", args);
export const archiveForumTopic: typeof _ArchiveForumTopic = (...args) =>
  callForumAction("archiveForumTopic", args);
export const archiveForumAttachment: typeof _ArchiveForumAttachment = (
  ...args
) => callForumAction("archiveForumAttachment", args);
export const getForumCategories: typeof _GetForumCategories = (...args) =>
  callForumAction("getForumCategories", args);
export const checkForumPermissions: typeof _CheckForumPermissions = (...args) =>
  callForumAction("checkForumPermissions", args);
export const softDeleteForumTopic: typeof _SoftDeleteForumTopic = (...args) =>
  callForumAction("softDeleteForumTopic", args);
export const softDeleteForumPost: typeof _SoftDeleteForumPost = (...args) =>
  callForumAction("softDeleteForumPost", args);
export const restoreForumTopic: typeof _RestoreForumTopic = (...args) =>
  callForumAction("restoreForumTopic", args);
export const restoreForumPost: typeof _RestoreForumPost = (...args) =>
  callForumAction("restoreForumPost", args);
export const subscribeToForumContent: typeof _SubscribeToForumContent = (
  ...args
) => callForumAction("subscribeToForumContent", args);
export const unsubscribeFromForumContent: typeof _UnsubscribeFromForumContent =
  (...args) => callForumAction("unsubscribeFromForumContent", args);
export const addForumReaction: typeof _AddForumReaction = (...args) =>
  callForumAction("addForumReaction", args);
export const removeForumReaction: typeof _RemoveForumReaction = (...args) =>
  callForumAction("removeForumReaction", args);
export const upvoteForumTopic: typeof _UpvoteForumTopic = (...args) =>
  callForumAction("upvoteForumTopic", args);
export const removeUpvoteForumTopic: typeof _RemoveUpvoteForumTopic = (
  ...args
) => callForumAction("removeUpvoteForumTopic", args);
export const getForumTopicUpvotes: typeof _GetForumTopicUpvotes = (...args) =>
  callForumAction("getForumTopicUpvotes", args);
export const getMyForumTopicVote: typeof _GetMyForumTopicVote = (...args) =>
  callForumAction("getMyForumTopicVote", args);
export const getForumSubscriptions: typeof _GetForumSubscriptions = (...args) =>
  callForumAction("getForumSubscriptions", args);
export const getMyVotesForTopics: typeof _GetMyVotesForTopics = (...args) =>
  callForumAction("getMyVotesForTopics", args);
export const getDunaCategoryId: typeof _GetDunaCategoryId = (...args) =>
  callForumAction("getDunaCategoryId", args);
export const getForumAdmins: typeof _GetForumAdmins = () =>
  serverGetForumAdmins() as any;
export const uploadAttachment: typeof _UploadAttachment = (...args) =>
  serverUploadAttachment({ data: { args } }) as any;
export const uploadToIPFSOnly: typeof _UploadToIPFSOnly = (...args) =>
  serverUploadToIPFSOnly({ data: { args } }) as any;
export const trackForumView: typeof _TrackForumView = (data) =>
  serverTrackForumView({ data }) as any;
export const createDiscussionProposalLink: typeof _CreateDiscussionProposalLink =
  (data) => serverCreateDiscussionProposalLink({ data }) as any;
export const getForumTopicTempChecks: typeof _GetForumTopicTempChecks = (
  topicId
) => serverGetForumTopicTempChecks({ data: { topicId } }) as any;
export const getProposalLinks: typeof _GetProposalLinks = (data) =>
  serverGetProposalLinks({ data }) as any;
export const getProposalLinksWithDetails: typeof _GetProposalLinksWithDetails =
  (proposalId) =>
    serverGetProposalLinksWithDetails({ data: { proposalId } }) as any;
export const getArchivedProposals: typeof _GetArchivedProposals = (filter) =>
  serverGetArchivedProposals({ data: { filter } }) as any;
