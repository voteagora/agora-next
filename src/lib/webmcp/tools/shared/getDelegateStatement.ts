import type { ToolDefinition } from "../../types";
import {
  textResult,
  errorResult,
  mdSection,
  mdBold,
  formatFullAddress,
} from "../../utils/formatters";

export function createGetDelegateStatementTool(
  baseUrl: string
): ToolDefinition {
  return {
    name: "get_delegate_statement",
    description:
      "Get a delegate's governance statement, top issues, and social links. Useful for understanding a delegate's position and priorities.",
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
        const statement = d.statement;

        if (!statement?.payload) {
          return textResult(
            `No delegate statement found for ${formatFullAddress(address)}.`
          );
        }

        const payload = statement.payload;
        const lines = [`# Delegate Statement: ${formatFullAddress(address)}`];

        const delegateStatement =
          payload.delegateStatement ?? payload.delegate_statement;
        if (delegateStatement) {
          lines.push("", mdSection("Statement", delegateStatement));
        }

        if (payload.topIssues?.length) {
          const issues = payload.topIssues
            .map(
              (i: { type?: string; value?: string }, idx: number) =>
                `${idx + 1}. ${mdBold(i.type ?? "Issue")}: ${i.value ?? ""}`
            )
            .join("\n");
          lines.push("", mdSection("Top Issues", issues));
        }

        const socials: string[] = [];
        if (statement.twitter)
          socials.push(`- ${mdBold("Twitter")}: ${statement.twitter}`);
        if (statement.discord)
          socials.push(`- ${mdBold("Discord")}: ${statement.discord}`);
        if (statement.warpcast)
          socials.push(`- ${mdBold("Warpcast")}: ${statement.warpcast}`);

        if (socials.length) {
          lines.push("", mdSection("Social Links", socials.join("\n")));
        }

        return textResult(lines.join("\n"));
      } catch (e) {
        return errorResult(
          `Failed to fetch delegate statement: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    },
  };
}
