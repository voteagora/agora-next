import type { ToolDefinition } from "../../types";
import {
  textResult,
  errorResult,
  mdTable,
  mdSection,
  mdStatus,
  formatAddress,
} from "../../utils/formatters";

export function createGetProposalsTool(baseUrl: string): ToolDefinition {
  return {
    name: "get_proposals",
    description:
      "List governance proposals for this DAO. Supports filtering by status (relevant/everything) and proposal type. Returns title, status, vote counts, and quorum info.",
    schema: {
      filter: {
        type: "string",
        enum: ["relevant", "everything"],
        description: "Filter proposals by relevance (default: relevant)",
      },
      type: {
        type: "string",
        description:
          "Proposal type filter: STANDARD, APPROVAL, OPTIMISTIC, SNAPSHOT, OFFCHAIN_STANDARD, OFFCHAIN_APPROVAL",
      },
      limit: {
        type: "number",
        description: "Max results to return (default: 10, max: 50)",
      },
      offset: {
        type: "number",
        description: "Pagination offset (default: 0)",
      },
    },
    handler: async (args) => {
      try {
        const params = new URLSearchParams();
        if (args.filter) params.set("filter", String(args.filter));
        if (args.type) params.set("type", String(args.type));
        if (args.limit) params.set("limit", String(args.limit));
        if (args.offset) params.set("offset", String(args.offset));

        const res = await fetch(`${baseUrl}/api/v1/proposals?${params}`);
        if (!res.ok) return errorResult(`API returned ${res.status}`);

        const data = await res.json();
        const proposals = data?.data ?? data?.proposals ?? [];

        if (!proposals.length) return textResult("No proposals found.");

        const rows = proposals.map(
          (p: {
            id?: string;
            proposalId?: string;
            markdowntitle?: string;
            title?: string;
            status?: string;
            proposer?: string;
            forVotes?: string;
            againstVotes?: string;
            abstainVotes?: string;
          }) => [
            p.id ?? p.proposalId ?? "—",
            (p.markdowntitle ?? p.title ?? "Untitled").slice(0, 60),
            mdStatus(p.status ?? "UNKNOWN"),
            formatAddress(p.proposer ?? "—"),
          ]
        );

        const table = mdTable(
          ["ID", "Title", "Status", "Proposer"],
          rows
        );

        const total = data?.meta?.total_returned ?? proposals.length;
        const header = `# Proposals (${total} results)\n\n`;

        return textResult(header + table);
      } catch (e) {
        return errorResult(
          `Failed to fetch proposals: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    },
  };
}
