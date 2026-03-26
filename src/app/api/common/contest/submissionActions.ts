"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import { uploadFileToPinata, getIPFSUrl } from "@/lib/pinata";
import { SubmissionAttachment } from "./getSubmissions";
import Tenant from "@/lib/tenant/tenant";
import { moderateTextContent, isContentNSFW } from "@/lib/moderation";

interface AttachmentInput {
  file: string; // base64
  filename: string;
  mime_type: string;
  label: string;
}

interface CreateSubmissionInput {
  title: string;
  contentMarkdown: string;
  authorEmail: string;
  ipAddress?: string;
  authorDisplayName?: string;
  authorGithub?: string;
  isAnonymous: boolean;
  attachments?: AttachmentInput[];
}

interface UpdateSubmissionInput {
  title?: string;
  contentMarkdown?: string;
  attachments?: AttachmentInput[];
}

async function uploadAttachmentToIPFS(
  attachment: AttachmentInput
): Promise<SubmissionAttachment> {
  const buffer = Buffer.from(attachment.file, "base64");
  const fileBlob = new Blob([buffer], { type: attachment.mime_type });
  const file = new File([fileBlob], attachment.filename, {
    type: attachment.mime_type,
  });

  const uploadResult = await uploadFileToPinata(file, {
    name: attachment.filename,
    keyvalues: {
      type: "contest-submission-attachment",
      originalName: attachment.filename,
      contentType: attachment.mime_type,
      uploadedAt: Date.now(),
    },
  });

  if (!uploadResult?.IpfsHash) {
    throw new Error(`Failed to upload attachment: ${attachment.filename}`);
  }

  return {
    type: attachment.mime_type.startsWith("image/") ? "image" : "document",
    ipfs_cid: uploadResult.IpfsHash,
    gateway_url: getIPFSUrl(uploadResult.IpfsHash),
    filename: attachment.filename,
    label: attachment.label || attachment.filename,
    size_bytes: buffer.length,
    mime_type: attachment.mime_type,
  };
}

export async function createSubmission(
  authorWallet: string,
  input: CreateSubmissionInput
) {
  const normalizedWallet = authorWallet.toLowerCase();

  const existingSubmission = await (
    prismaWeb2Client as any
  ).contestSubmission.findUnique({
    where: { authorWallet: normalizedWallet },
  });

  if (existingSubmission) {
    throw new Error("You have already submitted an entry to this contest");
  }

  const uploadedAttachments: SubmissionAttachment[] = [];
  if (input.attachments && input.attachments.length > 0) {
    for (const attachment of input.attachments) {
      const uploaded = await uploadAttachmentToIPFS(attachment);
      uploadedAttachments.push(uploaded);
    }
  }

  const trimmedDisplay = input.authorDisplayName?.trim();
  const votingPower = !input.isAnonymous && !!trimmedDisplay ? 1 : 0;
  const trimmedGithub = input.authorGithub?.trim();
  const submission = await (prismaWeb2Client as any).contestSubmission.create({
    data: {
      title: input.title,
      authorWallet: normalizedWallet,
      authorEmail: input.authorEmail,
      ipAddress: input.ipAddress || null,
      authorDisplayName: trimmedDisplay || null,
      authorGithub: trimmedGithub || null,
      isAnonymous: input.isAnonymous,
      contentMarkdown: input.contentMarkdown,
      attachments: uploadedAttachments,
      votingPower,
      status: "pending_review",
    },
  });

  return submission;
}

export async function createForumTopicFromSubmission(submission: {
  id: string;
  title: string;
  contentMarkdown: string;
  authorWallet: string;
}) {
  const tenant = Tenant.current();
  const normalizedAddress = submission.authorWallet.toLowerCase();
  const contestBaseUrl =
    process.env.NEXT_PUBLIC_AGORA_BASE_URL || "https://contest.agora.xyz";
  const submissionUrl = `${contestBaseUrl}/submissions/${submission.id}`;

  const forumBody = `${submission.contentMarkdown}\n\n---\n\n[View submission on contest page](${submissionUrl})`;

  let isNsfw = false;
  try {
    const moderation = await moderateTextContent(
      `${submission.title}\n\n${forumBody}`
    );
    isNsfw = isContentNSFW(moderation);
  } catch (error) {
    console.error("Submission forum moderation failed:", error);
  }

  const topic = await prismaWeb2Client.forumTopic.create({
    data: {
      title: submission.title,
      address: normalizedAddress,
      dao_slug: tenant.slug,
      categoryId: null,
      isNsfw,
    },
  });

  const post = await prismaWeb2Client.forumPost.create({
    data: {
      content: forumBody,
      address: normalizedAddress,
      topicId: topic.id,
      dao_slug: tenant.slug,
      isNsfw,
    },
  });

  return { topicId: topic.id, postId: post.id };
}

export async function updateSubmission(
  submissionId: string,
  authorWallet: string,
  input: UpdateSubmissionInput
) {
  const normalizedWallet = authorWallet.toLowerCase();

  const existingSubmission = await (
    prismaWeb2Client as any
  ).contestSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!existingSubmission) {
    throw new Error("Submission not found");
  }

  if (existingSubmission.authorWallet.toLowerCase() !== normalizedWallet) {
    throw new Error("You are not authorized to update this submission");
  }

  let attachments = existingSubmission.attachments;

  if (input.attachments && input.attachments.length > 0) {
    const uploadedAttachments: SubmissionAttachment[] = [];
    for (const attachment of input.attachments) {
      const uploaded = await uploadAttachmentToIPFS(attachment);
      uploadedAttachments.push(uploaded);
    }
    attachments = uploadedAttachments;
  }

  const updateData: any = {
    updatedAt: new Date(),
  };

  if (input.title !== undefined) {
    updateData.title = input.title;
  }

  if (input.contentMarkdown !== undefined) {
    updateData.contentMarkdown = input.contentMarkdown;
  }

  if (input.attachments !== undefined) {
    updateData.attachments = attachments;
  }

  const updatedSubmission = await (
    prismaWeb2Client as any
  ).contestSubmission.update({
    where: { id: submissionId },
    data: updateData,
  });

  return updatedSubmission;
}

export async function updateSubmissionStatus(
  submissionId: string,
  status: "qualified" | "disqualified",
  disqualificationReason?: string
) {
  if (status === "disqualified" && !disqualificationReason) {
    throw new Error("Disqualification reason is required");
  }

  const submission = await (prismaWeb2Client as any).contestSubmission.update({
    where: { id: submissionId },
    data: {
      status,
      disqualificationReason:
        status === "disqualified" ? disqualificationReason : null,
      updatedAt: new Date(),
    },
  });

  return submission;
}
