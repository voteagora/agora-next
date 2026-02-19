import type { ToolDefinition } from "../../types";
import {
  textResult,
  errorResult,
  mdTable,
  mdBold,
} from "../../utils/formatters";

export function createGetGrantsTool(baseUrl: string): ToolDefinition {
  return {
    name: "get_grants",
    description:
      "List governance grants and missions for this DAO. Only available on tenants that support grants programs.",
    schema: {
      limit: {
        type: "number",
        description: "Max results (default: 10)",
      },
    },
    handler: async (args) => {
      try {
        const limit = args.limit ? Number(args.limit) : 10;
        const res = await fetch(`${baseUrl}/api/v1/grants?limit=${limit}`);
        if (!res.ok) return errorResult(`API returned ${res.status}`);

        const data = await res.json();
        const grants = data?.data ?? data?.grants ?? [];

        if (!grants.length) return textResult("No grants found.");

        const rows = grants.map(
          (g: {
            id?: string;
            title?: string;
            status?: string;
            budget?: string;
          }) => [
            g.id ?? "—",
            (g.title ?? "Untitled").slice(0, 50),
            g.status ?? "—",
            g.budget ?? "—",
          ]
        );

        return textResult(
          `# Grants\n\n${mdTable(["ID", "Title", "Status", "Budget"], rows)}`
        );
      } catch (e) {
        return errorResult(
          `Failed to fetch grants: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    },
  };
}
