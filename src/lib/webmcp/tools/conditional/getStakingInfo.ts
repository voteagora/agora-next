import type { ToolDefinition } from "../../types";
import {
  textResult,
  errorResult,
  mdBold,
  formatFullAddress,
} from "../../utils/formatters";

export function createGetStakingInfoTool(
  baseUrl: string,
  tokenSymbol: string
): ToolDefinition {
  return {
    name: "get_staking_info",
    description: `Get staking information for a wallet address, including staked amounts and delegatee. Only available on tenants with staking support.`,
    schema: {
      address: {
        type: "string",
        description: "Wallet address to check staking info for",
      },
    },
    handler: async (args) => {
      const address = String(args.address);
      if (!address) return errorResult("address is required");

      try {
        const res = await fetch(
          `${baseUrl}/api/staking/getDeposits?address=${encodeURIComponent(address)}`
        );
        if (!res.ok) return errorResult(`API returned ${res.status}`);

        const data = await res.json();
        const deposits = data?.deposits ?? data ?? [];

        if (!Array.isArray(deposits) || !deposits.length) {
          return textResult(
            `No staking deposits found for ${formatFullAddress(address)}.`
          );
        }

        const lines = [
          `# Staking Info: ${formatFullAddress(address)}`,
          "",
        ];

        deposits.forEach(
          (
            d: {
              id?: number;
              amount?: string;
              delegatee?: string;
            },
            i: number
          ) => {
            lines.push(
              `### Deposit #${d.id ?? i + 1}`,
              `- ${mdBold("Amount")}: ${d.amount ?? "0"} ${tokenSymbol}`,
              `- ${mdBold("Delegatee")}: ${formatFullAddress(d.delegatee ?? "—")}`,
              ""
            );
          }
        );

        return textResult(lines.join("\n"));
      } catch (e) {
        return errorResult(
          `Failed to fetch staking info: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    },
  };
}
