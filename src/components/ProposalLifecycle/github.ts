import { Octokit } from "@octokit/rest";
import { ProposalDraft } from "@prisma/client";
import { markdownTable } from "markdown-table";
import { ProposalDraftWithTransactions } from "./types";

import { ethers } from "ethers";

const AGORA_PROXY_ACCOUNT = "agora-gov-bot";
const AGORA_ENS_FORK = "governance-docs";
const ENS_REPO_OWNER = "ensdomains";
const ENS_REPO_NAME = "governance-docs";
const BASE_BRANCH = "main"; // Base branch to create the new branch from
const BASE_PATH = "governance-proposals";

function getFormattedTransactionTable(proposal: ProposalDraftWithTransactions) {
  const markDownArray = [["Address", "Value", "Function", "Argument", "Value"]];

  proposal.transactions.forEach((transaction) => {
    const { type, target, value, calldata, function_details } = transaction;

    if (type === "transfer") {
      if (target === "0x") {
        markDownArray.push([function_details, value + " ETH", "", "", ""]);
      } else {
        markDownArray.push([target, "", "transfer", "to", function_details]);
        markDownArray.push([
          "",
          "",
          "",
          "amount",
          // ethers.utils
          //   .parseUnits(transferAmount.toString() || "0", token.decimals)
          //   .toString(),
          value.toString(),
        ]);
      }
    } else {
      // Decode custom transaction
      // const args = signature.split("(")[1].split(")")[0].split(",");
      // const functionName = signature.split("(")[0];
      // const functionArgs = args.map((arg) => arg.trim().split(" ")[1]);
      // const functionTypes = args.map((arg) => arg.trim().split(" ")[0]);
      // const callDataToDecode = "0x" + calldata.slice(10);

      // const decodedValues = ethers.utils.defaultAbiCoder.decode(
      //   functionTypes,
      //   callDataToDecode
      // );

      // functionArgs.forEach((arg, index) => {
      //   if (index === 0) {
      //     markDownArray.push([
      //       target,
      //       value + " ETH",
      //       functionName,
      //       arg,
      //       decodedValues[index].toString(),
      //     ]);
      //   } else {
      //     markDownArray.push([
      //       "",
      //       "",
      //       "",
      //       arg,
      //       decodedValues[index].toString(),
      //     ]);
      //   }
      // });
      markDownArray.push(["failed to decode transaction", "", "", "", ""]);
    }
  });

  const table = markdownTable(markDownArray);

  return table;
}

export default function formatGithubProposal(
  proposal: ProposalDraftWithTransactions
) {
  const descriptionTable = markdownTable([
    ["description"],
    [proposal.description],
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
    proposal.proposal_type === "executable"
      ? "[Agora](https://agora.ensdao.org/proposals/" + proposal.id + ")"
      : "[Snapshot](https://snapshot.org/#/ens.eth/proposal/" +
        proposal.id +
        ")"
  }                                                                                                                                     |
  `;

  const abstract = `# Abstract \n ${proposal.abstract}`;
  // const specification = `# Specification \n ${proposal.specification}`;
  const transactions =
    proposal.proposal_type === "executable"
      ? `# Transactions \n ${getFormattedTransactionTable(proposal)}`
      : "";

  const votingStrategy =
    proposal.proposal_type === "social"
      ? `# Voting Strategy \n ${proposal.voting_strategy_social}`
      : ``;

  const votingStrategyDates =
    proposal.proposal_type === "social"
      ? `# Voting Dates \n ${proposal.start_date_social} - ${proposal.end_date_social}`
      : ``;

  const socialOptionsBasic =
    proposal.proposal_type === "social" &&
    proposal.voting_strategy_social === "basic"
      ? `# Voting options \n For, Against, Abstain`
      : ``;

  const socialOptionsApproval =
    proposal.proposal_type === "social" &&
    proposal.voting_strategy_social === "approval"
      ? `# Voting options \n ${proposal.ProposalDraftOption.map(
          (option) => option.text
        ).join(", ")}`
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
  proposal: ProposalDraftWithTransactions
): Promise<string> {
  const octokit = new Octokit({
    auth: process.env.PR_BOT_TOKEN || "",
  });

  const content = Buffer.from(formatGithubProposal(proposal)).toString(
    "base64"
  );

  try {
    // Sync the forked branch
    await syncForkedBranch(
      octokit,
      AGORA_PROXY_ACCOUNT,
      AGORA_ENS_FORK,
      ENS_REPO_OWNER,
      ENS_REPO_NAME
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

    // Create the new branch
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

    // Update summary.md
    const summaryPath = `SUMMARY.md`;
    const summaryFile = await octokit.repos.getContent({
      owner: AGORA_PROXY_ACCOUNT,
      repo: AGORA_ENS_FORK,
      path: summaryPath,
    });

    if ("content" in summaryFile.data) {
      const summaryContentDecoded = atob(summaryFile.data.content);
      // Append link to the new file to the summary file
      // Escape brackets in the title
      const formattedTitle = proposal.title
        .replace(/\[/g, "\\[")
        .replace(/\]/g, "\\]");
      const termDirectory = `term-${parseTerm(proposal.title)}`;
      const newSummaryContent = `${summaryContentDecoded}   * [${formattedTitle}](${BASE_PATH}/${termDirectory}/${fileName})\n`;

      // Encode the updated content back to Base64
      const newSummaryContentEncoded = btoa(newSummaryContent);

      await octokit.repos.createOrUpdateFileContents({
        owner: AGORA_PROXY_ACCOUNT,
        repo: AGORA_ENS_FORK,
        path: summaryPath,
        message: "Update summary",
        content: newSummaryContentEncoded,
        branch: branch.data.ref,
        sha: summaryFile.data.sha,
      });
    } else {
      throw new Error("Expected a file but got a directory or none.");
    }

    const pullRequest = await octokit.pulls.create({
      owner:
        process.env.ENVIRONMENT === "prod"
          ? ENS_REPO_OWNER
          : AGORA_PROXY_ACCOUNT,
      repo: process.env.ENVIRONMENT === "prod" ? ENS_REPO_NAME : AGORA_ENS_FORK,
      title: proposal.title,
      head: `${AGORA_PROXY_ACCOUNT}:${branch.data.ref}`,
      base: BASE_BRANCH,
      body: proposal.description,
    });

    return pullRequest.data.html_url;
  } catch (error) {
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

    // Filter the response to get only the files and folders
    const baseFolderContents = foldersResponse.data;

    if (!Array.isArray(baseFolderContents)) {
      throw new Error("Invalid response");
    }

    const termDirectory = `term-${parseTerm(title)}`;

    const filesResponse = await octokit.repos.getContent({
      owner,
      repo,
      path: `${basePath}/${termDirectory}`,
    });

    // Filter the response to get only the files and folders
    const lastFolderFiles = filesResponse.data;

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
      path: `${basePath}/${termDirectory}/${fileName}`,
      fileName,
    };
  } catch (error) {
    console.error("Error getting folder contents:", error);
    throw new Error("Error getting folder contents");
  }
}

function parseTerm(title: string) {
  const match = title.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

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
