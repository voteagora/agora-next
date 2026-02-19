import type { ToolDefinition } from "../../types";
import {
  textResult,
  errorResult,
  mdTable,
  formatAddress,
} from "../../utils/formatters";

export function createGetProposalVotesTool(baseUrl: string): ToolDefinition {
  return {
    name: "get_proposal_votes",
    description:
      "Get votes cast on a specific governance proposal. Returns voter address, support (for/against/abstain), weight, and optional reason.",
    schema: {
      proposalId: {
        type: "string",
        description: "The proposal ID to fetch votes for",
      },
      sort: {
        type: "string",
        enum: ["weight", "block_number"],
        description: "Sort votes by weight or block number (default: weight)",
      },
      limit: {
        type: "number",
        description: "Max votes to return (default: 20)",
      },
    },
    handler: async (args) => {
      const proposalId = String(args.proposalId);
      if (!proposalId) return errorResult("proposalId is required");

      try {
        const params = new URLSearchParams();
        if (args.sort) params.set("sort", String(args.sort));
        if (args.limit) params.set("limit", String(args.limit));

        const res = await fetch(
          `${baseUrl}/api/v1/proposals/${encodeURIComponent(proposalId)}/votes?${params}`
        );
        if (!res.ok) return errorResult(`API returned ${res.status}`);

        const data = await res.json();
        const votes = data?.data ?? data?.votes ?? [];

        if (!votes.length) {
          return textResult(`No votes found for proposal \`${proposalId}\`.`);
        }

        const supportLabel = (s: string | number) => {
          const n = typeof s === "string" ? parseInt(s, 10) : s;
          if (n === 1) return "✅ For";
          if (n === 0) return "❌ Against";
          if (n === 2) return "⚪ Abstain";
          return String(s);
        };

        const rows = votes.map(
          (v: {
            voter?: string;
            address?: string;
            support?: string | number;
            weight?: string;
            reason?: string;
          }) => [
            formatAddress(v.voter ?? v.address ?? "—"),
            supportLabel(v.support ?? "—"),
            v.weight ?? "—",
            (v.reason ?? "").slice(0, 40) || "—",
          ]
        );

        const table = mdTable(
          ["Voter", "Support", "Weight", "Reason"],
          rows
        );

        return textResult(
          `# Votes for Proposal \`${proposalId}\`\n\n${table}`
        );
      } catch (e) {
        return errorResult(
          `Failed to fetch votes: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    },
  };
}
