import type { ToolDefinition } from "../../types";
import {
  textResult,
  errorResult,
  formatFullAddress,
  mdBold,
} from "../../utils/formatters";

export function createGetVotingPowerTool(
  baseUrl: string,
  tokenSymbol: string
): ToolDefinition {
  return {
    name: "get_voting_power",
    description: `Get the current voting power for a wallet address in this DAO. Returns the total voting power denominated in ${tokenSymbol}.`,
    schema: {
      address: {
        type: "string",
        description: "Wallet address to check voting power for",
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
        const vp = d.votingPower ?? {};

        const lines = [
          `# Voting Power: ${formatFullAddress(address)}`,
          "",
          `- ${mdBold("Total")}: ${vp.total ?? d.voting_power ?? "0"} ${tokenSymbol}`,
        ];

        if (vp.direct !== undefined) {
          lines.push(
            `- ${mdBold("Direct")}: ${vp.direct} ${tokenSymbol}`
          );
        }
        if (vp.advanced !== undefined) {
          lines.push(
            `- ${mdBold("Advanced (delegated)")}: ${vp.advanced} ${tokenSymbol}`
          );
        }

        return textResult(lines.join("\n"));
      } catch (e) {
        return errorResult(
          `Failed to fetch voting power: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    },
  };
}
