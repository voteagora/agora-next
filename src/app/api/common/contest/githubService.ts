"use server";

import { Octokit } from "@octokit/rest";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { SubmissionAttachment } from "./getSubmissions";

interface ContestSubmissionData {
  id: string;
  title: string;
  authorWallet: string;
  authorDisplayName: string | null;
  isAnonymous: boolean;
  contentMarkdown: string;
  attachments: unknown;
  githubPrUrl: string | null;
  githubPrNumber: number | null;
  status: string;
  submittedAt: Date;
}

const GITHUB_SUBMISSIONS_REPO =
  process.env.GITHUB_SUBMISSIONS_REPO ||
  "voteagora/novo-origo-contest-submissions";
const [REPO_OWNER, REPO_NAME] = GITHUB_SUBMISSIONS_REPO.split("/");
const BASE_BRANCH = "main";
const CONTEST_URL =
  process.env.NEXT_PUBLIC_AGORA_BASE_URL || "https://contest.agora.xyz";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatSubmissionReadme(submission: ContestSubmissionData): string {
  const authorDisplay = submission.isAnonymous
    ? "Anonymous"
    : submission.authorDisplayName || submission.authorWallet;
  const submittedDate = submission.submittedAt.toISOString().split("T")[0];
  const attachments = (submission.attachments as SubmissionAttachment[]) || [];

  let attachmentsSection = "";
  if (attachments.length > 0) {
    attachmentsSection = `
---

## Supporting Materials

${attachments
  .map(
    (att) =>
      `- [${att.label}](${att.gateway_url}) (${att.type}, ${formatBytes(att.size_bytes)})`
  )
  .join("\n")}
`;
  }

  return `# ${submission.title}

**Author:** ${authorDisplay}
**Submitted:** ${submittedDate}
**Status:** ${submission.status}

---

## Full Proposal

${submission.contentMarkdown}
${attachmentsSection}
---

*Submitted via the [Agora Novo Origo Prize](${CONTEST_URL}/info).*
`;
}

function getOctokit(): Octokit {
  const token = process.env.PR_BOT_TOKEN;
  if (!token) {
    throw new Error("PR_BOT_TOKEN is not configured");
  }
  return new Octokit({ auth: token });
}

export async function createGithubPR(
  submission: ContestSubmissionData
): Promise<{ prUrl: string; prNumber: number } | null> {
  try {
    const octokit = getOctokit();

    const shortId = submission.id.substring(0, 8);
    const titleSlug = slugify(submission.title);
    const branchName = `submission/${shortId}-${titleSlug}`;
    const filePath = `submissions/${shortId}-${titleSlug}/README.md`;

    const baseBranchRef = await octokit.git.getRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: `heads/${BASE_BRANCH}`,
    });
    const baseSha = baseBranchRef.data.object.sha;

    await octokit.git.createRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: `refs/heads/${branchName}`,
      sha: baseSha,
    });

    const content = Buffer.from(formatSubmissionReadme(submission)).toString(
      "base64"
    );

    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filePath,
      message: `Add submission: ${submission.title}`,
      content,
      branch: branchName,
    });

    const prBody = `## Novo Origo Prize Submission

**Title:** ${submission.title}
**Author:** ${submission.isAnonymous ? "Anonymous" : submission.authorDisplayName || submission.authorWallet}

[View on Contest Platform](${CONTEST_URL}/submissions/${submission.id})

---

This PR was automatically created when the submission was made via the Agora Novo Origo Prize platform.
`;

    const pr = await octokit.pulls.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title: `[Submission] ${submission.title}`,
      head: branchName,
      base: BASE_BRANCH,
      body: prBody,
    });

    await (prismaWeb2Client as any).contestSubmission.update({
      where: { id: submission.id },
      data: {
        githubPrUrl: pr.data.html_url,
        githubPrNumber: pr.data.number,
      },
    });

    return {
      prUrl: pr.data.html_url,
      prNumber: pr.data.number,
    };
  } catch (error) {
    console.error("Failed to create GitHub PR for submission:", error);
    return null;
  }
}

export async function updateGithubPR(
  submission: ContestSubmissionData
): Promise<boolean> {
  if (!submission.githubPrUrl || !submission.githubPrNumber) {
    console.warn("Submission does not have a GitHub PR associated");
    return false;
  }

  try {
    const octokit = getOctokit();

    const pr = await octokit.pulls.get({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      pull_number: submission.githubPrNumber,
    });

    const branchName = pr.data.head.ref;
    const shortId = submission.id.substring(0, 8);
    const titleSlug = slugify(submission.title);
    const filePath = `submissions/${shortId}-${titleSlug}/README.md`;

    let existingSha: string | undefined;
    try {
      const existingFile = await octokit.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: filePath,
        ref: branchName,
      });
      if (!Array.isArray(existingFile.data) && "sha" in existingFile.data) {
        existingSha = existingFile.data.sha;
      }
    } catch {
      // File doesn't exist yet
    }

    const content = Buffer.from(formatSubmissionReadme(submission)).toString(
      "base64"
    );

    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filePath,
      message: `Update submission: ${submission.title}`,
      content,
      branch: branchName,
      sha: existingSha,
    });

    const updateDate = new Date().toISOString().split("T")[0];
    await octokit.issues.createComment({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: submission.githubPrNumber,
      body: `Submission updated by author on ${updateDate}`,
    });

    return true;
  } catch (error) {
    console.error("Failed to update GitHub PR for submission:", error);
    return false;
  }
}
