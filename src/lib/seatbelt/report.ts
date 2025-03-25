import type { Link, Root } from "mdast";
import { remark } from "remark";
import remarkToc from "remark-toc";
import { visit } from "unist-util-visit";
import type { Visitor } from "unist-util-visit";
import type {
  AllCheckResults,
  ProposalEvent,
  SimulationCheck,
  SimulationEvent,
  SimulationStateChange,
  StructuredSimulationReport,
  TenderlySimulation,
} from "./types";
import { Block } from "ethers";
import { getBlockScanAddress, getBlockScanRawUrl } from "../utils";

// --- Markdown helpers ---

export function bullet(text: string, level = 0) {
  return `${" ".repeat(level * 4)}- ${text}`;
}

export function bold(text: string) {
  return `**${text}**`;
}

export function codeBlock(text: string) {
  // Line break, three backticks, line break, the text, line break, three backticks, line break
  return `\n\`\`\`\n${text}\n\`\`\`\n`;
}

/**
 * Block quotes a string in markdown
 * @param str string to block quote
 */
export function blockQuote(str: string) {
  return str
    .split("\n")
    .map((s) => `> ${s}`)
    .join("\n");
}

/**
 * Turns a plaintext address into a link to etherscan page of that address
 * @param address to be linked
 * @param code whether to link to the code tab
 */
export function toAddressLink(address: string, code = false) {
  return `[\`${address}\`](${getBlockScanAddress(address)}${code ? "#code" : ""})`; // todo correct explorer
}

// -- Report formatters ---

function toMessageList(header: string, text: string[]): string {
  return text.length > 0
    ? `${bold(header)}:\n\n${text.map((msg) => `${msg}`).join("\n")}`
    : "";
}

/**
 * Summarize the results of a specific check
 * @param errors the errors returned by the check
 * @param warnings the warnings returned by the check
 * @param name the descriptive name of the check
 */
function toCheckSummary({
  result: { errors, warnings, info },
  name,
}: AllCheckResults[string]): string {
  const status =
    errors.length === 0
      ? warnings.length === 0
        ? "✅ Passed"
        : "❗❗ **Passed with warnings**"
      : "❌ **Failed**";

  return `### ${name} ${status}

${toMessageList("Errors", errors)}

${toMessageList("Warnings", warnings)}

${toMessageList("Info", info)}
`;
}

/**
 * Pulls the title out of the markdown description, from the first markdown h1 line
 * @param description the proposal description
 */
function getProposalTitle(description: string, title?: string) {
  if (title) return title;
  const match = description.match(/^\s*#\s*(.*)\s*\n/);
  if (!match || match.length < 2) return "Title not found";
  return match[1];
}

/**
 * Format a block timestamp which is always in epoch seconds to a human readable string
 * @param blockTimestamp the block timestamp to format
 */
function formatTime(blockTimestamp: number): string {
  return `${new Date(blockTimestamp * 1000).toLocaleString("en-US", {
    timeZone: "America/New_York",
  })} ET`;
}

/**
 * Estimate the timestamp of a future block number
 * @param current the current block
 * @param block the future block number
 */
function estimateTime(current: Block, block: bigint): number {
  if (block < current.number) throw new Error("end block is less than current");
  return Number(Number(block) - current.number) * 13 + current.timestamp;
}

/**
 * Generate a structured report from the check results
 */
function generateStructuredReport(
  blocks: { current: Block; start: Block | null; end: Block | null },
  proposal: ProposalEvent,
  checks: AllCheckResults,
  sim: TenderlySimulation
): StructuredSimulationReport {
  // Extract title and proposal text
  const title = getProposalTitle(proposal.description.trim(), proposal.title);
  const proposalText = proposal.description.trim();

  // Determine overall status
  let status: "success" | "warning" | "error" = "success";
  for (const checkId in checks) {
    const { result } = checks[checkId];
    if (result.errors.length > 0) {
      status = "error";
      break;
    }
    if (result.warnings.length > 0) {
      status = "warning";
    }
  }

  // Format checks
  const formattedChecks: SimulationCheck[] = Object.entries(checks).map(
    ([_, check]) => {
      const { name, result } = check;
      const { errors, warnings, info } = result;

      let checkStatus: "passed" | "warning" | "failed" = "passed";
      if (errors.length > 0) {
        checkStatus = "failed";
      } else if (warnings.length > 0) {
        checkStatus = "warning";
      }

      // Combine all messages into details
      const details = [
        ...errors.map((msg) => `**Error**: ${msg}`),
        ...warnings.map((msg) => `**Warning**: ${msg}`),
        ...info.map((msg) => `**Info**: ${msg}`),
      ].join("\n\n");

      return {
        title: name,
        status: checkStatus,
        details: details.length > 0 ? details : undefined,
      };
    }
  );

  // Extract state changes
  const stateChanges: SimulationStateChange[] = [];
  // Look for state changes in the check results
  for (const checkId in checks) {
    const { result } = checks[checkId];

    // Track the current contract name and address
    let currentContract = "";
    let currentContractAddress = "";

    for (const infoMsg of result.info) {
      // Check if this is a contract name line
      const contractNameMatch = infoMsg.match(
        /- (.+?) at `(0x[a-fA-F0-9]{40})`/
      );
      if (contractNameMatch) {
        currentContract = contractNameMatch[1].trim();
        currentContractAddress = contractNameMatch[2];
        continue;
      }

      // Try to extract mapping state changes from info messages
      const mappingStateChangeMatch = infoMsg.match(
        /`(.+?)`\s+key\s+`(.+?)`\s+changed\s+from\s+`(.+?)`\s+to\s+`(.+?)`/
      );
      if (mappingStateChangeMatch) {
        // Use the current contract name and address if available
        stateChanges.push({
          contract: currentContract || mappingStateChangeMatch[1],
          contractAddress: currentContractAddress || undefined,
          key: mappingStateChangeMatch[2],
          oldValue: mappingStateChangeMatch[3],
          newValue: mappingStateChangeMatch[4],
        });
        continue;
      }

      // Try to extract simple type state changes from info messages
      const simpleStateChangeMatch = infoMsg.match(
        /`(.+?)`\s+changed\s+from\s+`(.+?)`\s+to\s+`(.+?)`/
      );
      if (simpleStateChangeMatch) {
        // Use the current contract name and address if available
        stateChanges.push({
          contract: currentContract,
          contractAddress: currentContractAddress,
          key: simpleStateChangeMatch[1],
          oldValue: simpleStateChangeMatch[2],
          newValue: simpleStateChangeMatch[3],
        });
      }
    }
  }

  // Extract events
  const events: SimulationEvent[] = [];
  // Look for events in the check results
  for (const checkId in checks) {
    const { result } = checks[checkId];
    for (const infoMsg of result.info) {
      // Try to extract events from info messages
      const eventMatch = infoMsg.match(
        /`(.+?)`\s+at\s+`(.+?)`\s*\n\s+\*\s+`(.+?)`/
      );
      if (eventMatch) {
        events.push({
          name: eventMatch[1],
          contract: eventMatch[2],
          params: [{ name: "params", value: eventMatch[3], type: "unknown" }],
        });
      }
    }
  }

  // Create the structured report
  return {
    title,
    proposalText,
    status,
    summary: `Simulation ${status === "success" ? "completed successfully" : status === "warning" ? "completed with warnings" : "failed"} for proposal: "${title}".`,
    checks: formattedChecks,
    stateChanges,
    events,
    metadata: {
      blockNumber: blocks.current.number.toString(),
      timestamp: blocks.current.timestamp.toString(),
      proposalId: proposal.id?.toString() ?? "",
      proposer: proposal.proposer,
    },
    simulation: sim,
  };
}

/**
 * Generates the proposal report and saves Markdown, PDF, and HTML versions of it.
 * Also writes the report data to the frontend/public directory for easy access.
 * @param blocks the relevant blocks for the proposal.
 * @param proposal The proposal details.
 * @param checks The checks results.
 * @param dir The directory where the file should be saved. It will be created if it doesn't exist.
 * @param filename The name of the file. All report formats will have the same filename with different extensions.
 */
export async function generateAndSaveReports(
  blocks: { current: Block; start: Block | null; end: Block | null },
  proposal: ProposalEvent,
  checks: AllCheckResults,
  dir: string,
  sim: TenderlySimulation
) {
  // todo: correctly save it
  // Prepare the output folder and filename.
  // if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Generate the base markdown proposal report. This is the markdown report which is translated into other file types.
  const baseReport = await toMarkdownProposalReport(blocks, proposal, checks);

  // The table of contents' links in the baseReport work when converted to HTML, but do not work as Markdown
  // or PDF links, since the emojis in the header titles cause issues. We apply the remarkFixEmojiLinks plugin
  // to fix this, and use this updated version when generating the Markdown and PDF reports.
  const markdownReport = String(
    await remark().use(remarkFixEmojiLinks).process(baseReport)
  );

  // Also write the report data to the frontend/public directory
  try {
    // Generate the structured report
    const structuredReport = generateStructuredReport(
      blocks,
      proposal,
      checks,
      sim
    );

    // Create a simplified report structure for the frontend
    const reportForFrontend = {
      status: structuredReport.status,
      summary: structuredReport.summary,
      markdownReport, // Include the full markdown report
      structuredReport, // Include the structured report
    };

    return reportForFrontend;
  } catch (error) {
    console.error("Error writing frontend data:", error);
  }
}

/**
 * Produce a markdown report summarizing the result of all the checks for a given proposal.
 * @param blocks the relevant blocks for the proposal.
 * @param proposal The proposal details.
 * @param checks The checks results.
 */
async function toMarkdownProposalReport(
  blocks: { current: Block; start: Block | null; end: Block | null },
  proposal: ProposalEvent,
  checks: AllCheckResults
): Promise<string> {
  const { proposer, targets, endBlock, startBlock, description } = proposal;

  // Generate the report. We insert an empty table of contents header which is populated later using remark-toc.
  const report = `
# ${getProposalTitle(description.trim())}

_Updated as of block [${blocks.current.number}](${getBlockScanRawUrl()}/block/${blocks.current.number}) at ${formatTime(
    blocks.current.timestamp
  )}_

- ID: ${proposal.id?.toString()}
- Proposer: ${toAddressLink(proposer)}
- Start Block: ${startBlock} (${
    blocks.start
      ? formatTime(blocks.start.timestamp)
      : formatTime(estimateTime(blocks.current, startBlock))
  })
- End Block: ${endBlock} (${
    blocks.end
      ? formatTime(blocks.end.timestamp)
      : formatTime(estimateTime(blocks.current, endBlock))
  })
- Targets: ${targets.map((target) => toAddressLink(target, true)).join("; ")}

## Table of contents

This is filled in by remark-toc and this sentence will be removed.

## Proposal Text

${blockQuote(description.trim())}

## Checks\n
${Object.keys(checks)
  .map((checkId) => toCheckSummary(checks[checkId]))
  .join("\n")}
`;

  // Add table of contents and return report.
  return (
    await remark().use(remarkToc, { tight: true }).process(report)
  ).toString();
}

/**
 * Intra-doc links are broken if the header has emojis, so we fix that here.
 * @dev This is a remark plugin, see the remark docs for more info on how it works.
 */
function remarkFixEmojiLinks() {
  return (tree: Root) => {
    visit(tree, "link", ((node: Link) => {
      if (node.url) {
        const isInternalLink = node.url.startsWith("#");
        if (isInternalLink && node.url.endsWith("--passed-with-warnings")) {
          node.url = node.url.replace(
            "--passed-with-warnings",
            "-❗❗-passed-with-warnings"
          );
        } else if (isInternalLink && node.url.endsWith("--passed")) {
          node.url = node.url.replace("--passed", "-✅-passed");
        } else if (isInternalLink && node.url.endsWith("--failed")) {
          node.url = node.url.replace("--failed", "-❌-failed");
        }
      }
    }) as Visitor<Link>);
  };
}
