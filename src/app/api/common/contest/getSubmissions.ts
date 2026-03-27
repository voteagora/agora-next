import { cache } from "react";
import { prismaWeb2Client } from "@/app/lib/prisma";

interface ContestSubmission {
  id: string;
  title: string;
  authorWallet: string;
  authorEmail: string;
  authorDisplayName: string | null;
  authorGithub: string | null;
  isAnonymous: boolean;
  contentMarkdown: string;
  attachments: unknown;
  githubPrUrl: string | null;
  githubPrNumber: number | null;
  forumTopicId: number | null;
  votingPower: number;
  status: string;
  disqualificationReason: string | null;
  ipAddress: string | null;
  moderationFlagged: boolean;
  submittedAt: Date;
  updatedAt: Date;
}

/** DB columns excluded from public list/detail APIs (same pattern as authorEmail). */
type PrivateContestSubmissionKeys = "authorEmail" | "ipAddress";

type ContestSubmissionPublicFields = Omit<
  ContestSubmission,
  PrivateContestSubmissionKeys
>;

const contestSubmissionPublicSelect = {
  id: true,
  title: true,
  authorWallet: true,
  authorDisplayName: true,
  authorGithub: true,
  isAnonymous: true,
  contentMarkdown: true,
  attachments: true,
  githubPrUrl: true,
  githubPrNumber: true,
  forumTopicId: true,
  votingPower: true,
  status: true,
  disqualificationReason: true,
  moderationFlagged: true,
  submittedAt: true,
  updatedAt: true,
} as const;

export interface SubmissionAttachment {
  type: string;
  ipfs_cid: string;
  gateway_url: string;
  filename: string;
  label: string;
  size_bytes: number;
  mime_type: string;
}

export interface PublicSubmission {
  id: string;
  title: string;
  authorWallet: string | null;
  authorDisplayName: string | null;
  authorGithub: string | null;
  isAnonymous: boolean;
  contentMarkdown: string;
  attachments: SubmissionAttachment[];
  githubPrUrl: string | null;
  githubPrNumber: number | null;
  forumTopicId: number | null;
  votingPower: number;
  status: string;
  moderationFlagged: boolean;
  submittedAt: Date;
  updatedAt: Date;
}

function sanitizeSubmissionForPublic(
  submission: ContestSubmissionPublicFields
): PublicSubmission {
  const isAnonymous = submission.isAnonymous;
  return {
    id: submission.id,
    title: submission.title,
    authorWallet: isAnonymous ? null : submission.authorWallet,
    authorDisplayName: isAnonymous ? null : submission.authorDisplayName,
    authorGithub: isAnonymous ? null : submission.authorGithub,
    isAnonymous: submission.isAnonymous,
    contentMarkdown: submission.contentMarkdown,
    attachments: (submission.attachments as SubmissionAttachment[]) || [],
    githubPrUrl: submission.githubPrUrl,
    githubPrNumber: submission.githubPrNumber,
    forumTopicId: submission.forumTopicId,
    votingPower: submission.votingPower,
    status: submission.status,
    moderationFlagged: submission.moderationFlagged,
    submittedAt: submission.submittedAt,
    updatedAt: submission.updatedAt,
  };
}

export async function getSubmissions(options?: {
  status?: string;
  sort?: "submitted_at" | "updated_at";
  order?: "asc" | "desc";
}): Promise<PublicSubmission[]> {
  const { status, sort = "submitted_at", order = "desc" } = options || {};

  const whereClause: any = {
    status: {
      not: "disqualified",
    },
  };

  if (status) {
    whereClause.status = status;
  }

  const submissions = await (
    prismaWeb2Client as any
  ).contestSubmission.findMany({
    where: whereClause,
    select: contestSubmissionPublicSelect,
    orderBy: {
      [sort === "submitted_at" ? "submittedAt" : "updatedAt"]: order,
    },
  });

  return submissions.map(sanitizeSubmissionForPublic);
}

export async function getSubmissionById(
  id: string
): Promise<PublicSubmission | null> {
  const submission = await (
    prismaWeb2Client as any
  ).contestSubmission.findUnique({
    where: { id },
    select: contestSubmissionPublicSelect,
  });

  if (!submission) {
    return null;
  }

  return sanitizeSubmissionForPublic(submission);
}

export async function getSubmissionByWallet(
  wallet: string
): Promise<ContestSubmissionPublicFields | null> {
  return (prismaWeb2Client as any).contestSubmission.findUnique({
    where: { authorWallet: wallet.toLowerCase() },
    select: contestSubmissionPublicSelect,
  });
}

export async function checkWalletHasSubmission(
  wallet: string
): Promise<boolean> {
  const submission = await (
    prismaWeb2Client as any
  ).contestSubmission.findUnique({
    where: { authorWallet: wallet.toLowerCase() },
    select: { id: true },
  });
  return submission !== null;
}

export const fetchSubmissions = cache(
  async (options?: {
    status?: string;
    sort?: "submitted_at" | "updated_at";
    order?: "asc" | "desc";
  }) => {
    "use server";
    return getSubmissions(options);
  }
);

export const fetchSubmissionById = cache(async (id: string) => {
  "use server";
  return getSubmissionById(id);
});

export const fetchSubmissionByWallet = cache(async (wallet: string) => {
  "use server";
  return getSubmissionByWallet(wallet);
});
