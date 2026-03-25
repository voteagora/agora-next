"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import { uploadFileToPinata, getIPFSUrl } from "@/lib/pinata";
import { SubmissionAttachment } from "./getSubmissions";

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

  const votingPower = input.isAnonymous ? 1 : 3;

  const submission = await (prismaWeb2Client as any).contestSubmission.create({
    data: {
      title: input.title,
      authorWallet: normalizedWallet,
      authorEmail: input.authorEmail,
      authorDisplayName: input.isAnonymous ? null : input.authorDisplayName,
      authorGithub: input.isAnonymous ? null : input.authorGithub,
      isAnonymous: input.isAnonymous,
      contentMarkdown: input.contentMarkdown,
      attachments: uploadedAttachments,
      votingPower,
      status: "pending_review",
    },
  });

  return submission;
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

export async function createSubmissionComment(
  submissionId: string,
  authorWallet: string,
  authorDisplayName: string | null,
  content: string
) {
  const submission = await (
    prismaWeb2Client as any
  ).contestSubmission.findUnique({
    where: { id: submissionId },
    select: { id: true },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  const comment = await (
    prismaWeb2Client as any
  ).contestSubmissionComment.create({
    data: {
      submissionId,
      authorWallet: authorWallet.toLowerCase(),
      authorDisplayName,
      content,
    },
  });

  return comment;
}

export async function getSubmissionComments(submissionId: string) {
  return (prismaWeb2Client as any).contestSubmissionComment.findMany({
    where: { submissionId },
    orderBy: { createdAt: "asc" },
  });
}
