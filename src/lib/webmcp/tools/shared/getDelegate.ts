import type { ToolDefinition } from "../../types";
import {
  textResult,
  errorResult,
  mdSection,
  mdBold,
  formatFullAddress,
  formatPercentage,
} from "../../utils/formatters";

export function createGetDelegateTool(baseUrl: string): ToolDefinition {
  return {
    name: "get_delegate",
    description:
      "Get a delegate's profile including voting power, number of delegators, participation rate, and delegate statement. Accepts an address or ENS name.",
    schema: {
      address: {
        type: "string",
        description: "Wallet address or ENS name of the delegate",
      },
    },
    handler: async (args) => {
      const address = String(args.address);
      if (!address) return errorResult("address is required");

      try {
        const res = await fetch(
          `${baseUrl}/api/v1/delegates/${encodeURIComponent(address)}`
        );
        if (!res.ok) return errorResult(`API returned ${res.status}`);

        const data = await res.json();
        const d = data?.delegate ?? data;

        const votingPower = d.votingPower?.total ?? d.voting_power ?? "0";
        const delegators = d.numOfDelegators ?? d.from_cnt ?? 0;
        const participation = d.participation ?? d.stats?.participation;

        const lines = [
          `# Delegate: ${formatFullAddress(address)}`,
          "",
          `- ${mdBold("Voting Power")}: ${votingPower}`,
          `- ${mdBold("Delegators")}: ${delegators}`,
        ];

        if (participation) {
          if (Array.isArray(participation)) {
            const [voted, total] = participation;
            lines.push(
              `- ${mdBold("Participation")}: ${voted}/${total} proposals (${formatPercentage(total > 0 ? voted / total : 0)})`
            );
          } else {
            lines.push(
              `- ${mdBold("Participation")}: ${formatPercentage(Number(participation))}`
            );
          }
        }

        if (d.statement?.payload) {
          const payload = d.statement.payload;
          const delegateStatement =
            payload.delegateStatement ?? payload.delegate_statement ?? "";
          if (delegateStatement) {
            lines.push(
              "",
              mdSection(
                "Delegate Statement",
                delegateStatement.slice(0, 500) +
                  (delegateStatement.length > 500 ? "…" : "")
              )
            );
          }
          if (payload.topIssues?.length) {
            const issues = payload.topIssues
              .map(
                (i: { type?: string; value?: string }) =>
                  `- ${i.type ?? "Issue"}: ${i.value ?? ""}`
              )
              .join("\n");
            lines.push("", mdSection("Top Issues", issues));
          }
        }

        if (d.twitter) lines.push(`- ${mdBold("Twitter")}: ${d.twitter}`);
        if (d.discord) lines.push(`- ${mdBold("Discord")}: ${d.discord}`);

        return textResult(lines.join("\n"));
      } catch (e) {
        return errorResult(
          `Failed to fetch delegate: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    },
  };
}
