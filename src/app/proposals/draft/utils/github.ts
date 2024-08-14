"use server";

import { Octokit } from "@octokit/rest";
import { ProposalDraft, ProposalDraftTransaction } from "@prisma/client";
import { markdownTable } from "markdown-table";
import { formatTransactions } from "./formatTransactions";
import { DraftProposal, ProposalType } from "../types";

const AGORA_PROXY_ACCOUNT = "agora-gov-bot";
const AGORA_ENS_FORK = "docs";
const ENS_REPO_OWNER = "ensdomains";
const ENS_REPO_NAME = "docs";
const BASE_BRANCH = "master"; // Base branch to create the new branch from
const BASE_PATH = "docs/dao/proposals";

function getFormattedTransactionTable(
  proposal: ProposalDraft & { transactions: ProposalDraftTransaction[] }
) {
  const markDownArray = [["Address", "Value", "Function", "Argument", "Value"]];
  const parsedTransactions = formatTransactions(proposal.transactions);
  const options =
    parsedTransactions.key !== "SNAPSHOT"
      ? parsedTransactions.kind?.options
      : [];

  const transactionObject = options[0];
  for (let i = 0; i < transactionObject.targets.length; i++) {
    markDownArray.push([
      transactionObject.targets[i], // target
      transactionObject.values[i], // value
      transactionObject.functionArgsName[i].functionName, // fn
      transactionObject.functionArgsName[i].functionArgs.join(", "), // args
      "", // value?
    ]);
  }

  const table = markdownTable(markDownArray);
  return table;
}

function formatGithubProposal(proposal: DraftProposal) {
  const descriptionTable = markdownTable([
    ["description"],
    [proposal.abstract],
  ]);

  const title = `# ${proposal.title}`;

  const statusTable = `
  | **Status**            | Pending                                                                                                                                      |
  | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
  | **Discussion Thread** |  ${
    proposal.temp_check_link !== ""
      ? "[Discourse](" + proposal.temp_check_link + ")"
      : "N/A"
  }                                                                                              |
  | **Discussion Temp Check** |  ${
    proposal.temp_check_link !== ""
      ? "[Discourse](" + proposal.temp_check_link + ")"
      : "N/A"
  }                                                                                              |
  | **Votes**             | ${
    proposal.proposal_type === ProposalType.BASIC
      ? "[Agora](https://agora.ensdao.org/proposals/" + proposal.id + ")"
      : "[Snapshot](https://snapshot.org/#/ens.eth/proposal/" +
        proposal.id +
        ")"
  }                                                                                                                                     |
  `;

  const abstract = `# Description \n ${proposal.abstract}`;
  const transactions =
    proposal.proposal_type === ProposalType.BASIC
      ? `# Transactions \n ${getFormattedTransactionTable(proposal)}`
      : "";

  const votingStrategy =
    proposal.proposal_type === ProposalType.SOCIAL
      ? `# Voting Strategy \n ${proposal.proposal_social_type}`
      : ``;

  const votingStrategyDates =
    proposal.proposal_type === ProposalType.SOCIAL
      ? `# Voting Dates \n ${proposal.start_date_social} - ${proposal.end_date_social}`
      : ``;

  const socialOptionsBasic =
    proposal.proposal_type === ProposalType.SOCIAL &&
    proposal.proposal_social_type === "basic"
      ? `# Voting options \n For, Against, Abstain`
      : ``;

  const socialOptionsApproval =
    proposal.proposal_type === ProposalType.SOCIAL &&
    proposal.proposal_social_type === "approval"
      ? `# Voting options \n ${proposal.social_options
          .map((option) => option.text)
          .join(", ")}`
      : ``;

  const content =
    descriptionTable +
    "\n\n" +
    title +
    "\n\n" +
    statusTable +
    "\n\n" +
    abstract +
    "\n\n" +
    transactions +
    "\n\n" +
    votingStrategy +
    "\n\n" +
    votingStrategyDates +
    "\n\n" +
    socialOptionsBasic +
    "\n\n" +
    socialOptionsApproval;

  return content;
}

export async function createGithubProposal(
  proposal: DraftProposal
): Promise<string> {
  console.log("pr token", process.env.PR_BOT_TOKEN);
  const octokit = new Octokit({
    auth: process.env.PR_BOT_TOKEN || "",
  });

  try {
    // Sync the forked branch
    await syncForkedBranch(
      octokit,
      AGORA_PROXY_ACCOUNT,
      AGORA_ENS_FORK,
      ENS_REPO_OWNER,
      ENS_REPO_NAME
    );

    const content = Buffer.from(formatGithubProposal(proposal)).toString(
      "base64"
    );

    // Get the latest commit SHA of the base branch
    const baseBranchRef = await octokit.git.getRef({
      owner: AGORA_PROXY_ACCOUNT,
      repo: AGORA_ENS_FORK,
      ref: `heads/${BASE_BRANCH}`,
    });

    const baseBranchSHA = baseBranchRef.data.object.sha;

    // Get file name
    const { path, fileName } = await getFolderContents(
      octokit,
      AGORA_PROXY_ACCOUNT,
      AGORA_ENS_FORK,
      BASE_PATH,
      proposal.title
    );

    const formattedFileName = fileName.replace(".md", "");

    const branch = await octokit.git.createRef({
      owner: AGORA_PROXY_ACCOUNT,
      repo: AGORA_ENS_FORK,
      ref: `refs/heads/${formattedFileName + "-" + new Date().getTime()}`,
      sha: baseBranchSHA,
    });

    // Add the file to the new branch
    await octokit.repos.createOrUpdateFileContents({
      owner: AGORA_PROXY_ACCOUNT,
      repo: AGORA_ENS_FORK,
      path: path,
      message: "New proposal",
      content: content,
      branch: branch.data.ref,
    });

    const pullRequest = await octokit.pulls.create({
      owner:
        process.env.ENVIRONMENT === "prod"
          ? ENS_REPO_OWNER
          : AGORA_PROXY_ACCOUNT,
      repo: process.env.ENVIRONMENT === "prod" ? ENS_REPO_NAME : AGORA_ENS_FORK,
      title: proposal.title,
      head: `${AGORA_PROXY_ACCOUNT}:${branch.data.ref}`,
      base: BASE_BRANCH,
      body: proposal.abstract,
    });

    return pullRequest.data.html_url;
  } catch (error) {
    console.error("------------------------------------------");
    console.error("Error creating PR:", error);
    throw new Error("Error creating PR");
  }
}

async function getFolderContents(
  octokit: Octokit,
  owner: string,
  repo: string,
  basePath: string,
  title: string
) {
  try {
    const foldersResponse = await octokit.repos.getContent({
      owner,
      repo,
      path: basePath,
    });

    const lastFolderFiles = foldersResponse.data;

    if (!Array.isArray(lastFolderFiles)) {
      throw new Error("Invalid response");
    }

    const fileName = `${
      title
        .replace(/\s+/g, "-") // Replace spaces with dashes
        .replace(/[\[{(<\]})>\s]/g, function (match) {
          switch (match) {
            case "{":
            case "(":
            case "[":
            case "<":
            case " ":
              return "";
            default:
              return "-";
          }
        }) // Remove all brackets
        .replace(/[^\w\s.-]/g, "") // Remove all non-word characters except spaces, dashes, and periods
        .replace(/(\W)\1+/g, "$1") // Replace sequences of the same non-word character with a single occurrence
        .toLowerCase() // Convert to lowercase
        .replace(/^[-.]+|[-.]+$/g, "") // Remove leading and trailing dashes and periods
    }.md`;

    return {
      path: `${basePath}/${fileName}`,
      fileName,
    };
  } catch (error) {
    console.error("Error getting folder contents:", error);
    throw new Error("Error getting folder contents");
  }
}

// syncs the branches so there are no other merge conflicts before we create our PR
async function syncForkedBranch(
  octokit: Octokit,
  owner: string,
  repo: string,
  upstreamOwner: string,
  upstreamRepo: string
) {
  try {
    const baseBranch = BASE_BRANCH; // Base branch in the upstream repository
    const forkBranch = BASE_BRANCH; // Branch in your forked repository

    // Step 1: Get the base branch information
    const baseBranchInfo = await octokit.repos.getBranch({
      owner: upstreamOwner,
      repo: upstreamRepo,
      branch: baseBranch,
    });

    const baseBranchSHA = baseBranchInfo.data.commit.sha;

    // Step 2: Update the new branch with the upstream changes
    const compareResponse = await octokit.repos.compareCommits({
      owner,
      repo,
      base: `${owner}:${forkBranch}`,
      head: `${upstreamOwner}:${baseBranch}`,
    });

    if (compareResponse.data.status === "identical") {
      return;
    }

    // Step 3: Merge the changes
    await octokit.repos.merge({
      owner,
      repo,
      base: forkBranch,
      head: baseBranchSHA,
    });
  } catch (error) {
    console.error("Error syncing the branch:", error);
    throw new Error("Error syncing the branch");
  }
}
