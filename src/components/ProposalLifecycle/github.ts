import { Octokit } from "@octokit/rest";
import { ProposalDraft } from "@prisma/client";
import { markdownTable } from "markdown-table";
import { ProposalDraftWithTransactions } from "./types";

const AGORA_PROXY_ACCOUNT = "agora-gov-bot";
const AGORA_ENS_FORK = "governance-docs";
const ENS_REPO_OWNER = "ensdomains";
const ENS_REPO_NAME = "governance-docs";
const BASE_BRANCH = "main"; // Base branch to create the new branch from
const BASE_PATH = "governance-proposals";

// TODO add transactions to the proposal
// function getFormattedTransactionTable(proposal: ProposalDraftWithTransactions) {
//   const markDownArray = [["Address", "Value", "Function", "Argument", "Value"]];

//   proposal.transactions.forEach((transaction) => {
//     const {
//       type,
//       target,
//       value,
//       calldata,
//       transferAmount,
//       transferTo,
//       signature,
//       token,
//     } = transaction;

//     if (type === "Transfer") {
//       if (token.name === "ETH") {
//         markDownArray.push([transferTo, transferAmount + " ETH", "", "", ""]);
//       } else {
//         markDownArray.push([token.address, "", "transfer", "to", transferTo]);
//         markDownArray.push([
//           "",
//           "",
//           "",
//           "amount",
//           ethers.utils
//             .parseUnits(transferAmount.toString() || "0", token.decimals)
//             .toString(),
//         ]);
//       }
//     } else {
//       // Decode custom transaction
//       const args = signature.split("(")[1].split(")")[0].split(",");
//       const functionName = signature.split("(")[0];
//       const functionArgs = args.map((arg) => arg.trim().split(" ")[1]);
//       const functionTypes = args.map((arg) => arg.trim().split(" ")[0]);
//       const callDataToDecode = "0x" + calldata.slice(10);

//       const decodedValues = ethers.utils.defaultAbiCoder.decode(
//         functionTypes,
//         callDataToDecode
//       );

//       functionArgs.forEach((arg, index) => {
//         if (index === 0) {
//           markDownArray.push([
//             target,
//             value + " ETH",
//             functionName,
//             arg,
//             decodedValues[index].toString(),
//           ]);
//         } else {
//           markDownArray.push([
//             "",
//             "",
//             "",
//             arg,
//             decodedValues[index].toString(),
//           ]);
//         }
//       });
//     }
//   });

//   const table = markdownTable(markDownArray);

//   return table;
// }

export default function formatGithubProposal(proposal: ProposalDraft) {
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
    proposal.proposal_type === "Executable"
      ? "[Agora](https://agora.ensdao.org/proposals/" + proposal.id + ")"
      : "[Snapshot](https://snapshot.org/#/ens.eth/proposal/" +
        proposal.id +
        ")"
  }                                                                                                                                     |
  `;

  const abstract = `# Abstract \n ${proposal.abstract}`;
  // const specification = `# Specification \n ${proposal.specification}`;
  // const transactions =
  //   proposal.proposal_type === "Executable"
  //     ? `# Transactions \n ${getFormattedTransactionTable(form)}`
  //     : "";

  // TODO add transactions

  const content =
    descriptionTable +
    "\n\n" +
    title +
    "\n\n" +
    statusTable +
    "\n\n" +
    abstract;
  // "\n\n" +
  // specification +
  // "\n\n" +
  // transactions;

  return content;
}

export async function createGithubProposal(
  proposal: ProposalDraft
): Promise<string> {
  const octokit = new Octokit({
    auth: process.env.PR_BOT_TOKEN || "",
  });

  const content = Buffer.from(formatGithubProposal(proposal)).toString(
    "base64"
  );

  console.log("titleeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", proposal.title);

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

    return pullRequest.data.url;
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
