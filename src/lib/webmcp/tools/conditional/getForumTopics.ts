import type { ToolDefinition } from "../../types";
import {
  textResult,
  errorResult,
  mdTable,
} from "../../utils/formatters";

export function createGetForumTopicsTool(baseUrl: string): ToolDefinition {
  return {
    name: "get_forum_topics",
    description:
      "List recent forum discussion topics for this DAO. Only available on tenants with forum support enabled.",
    schema: {
      limit: {
        type: "number",
        description: "Max results (default: 10)",
      },
    },
    handler: async (args) => {
      try {
        const limit = args.limit ? Number(args.limit) : 10;
        const res = await fetch(
          `${baseUrl}/api/v1/forum?limit=${limit}`
        );
        if (!res.ok) return errorResult(`API returned ${res.status}`);

        const data = await res.json();
        const topics = data?.data ?? data?.topics ?? [];

        if (!topics.length) return textResult("No forum topics found.");

        const rows = topics.map(
          (t: {
            id?: string;
            title?: string;
            author?: string;
            reply_count?: number;
            created_at?: string;
          }) => [
            (t.title ?? "Untitled").slice(0, 50),
            t.author ?? "—",
            String(t.reply_count ?? 0),
            t.created_at?.split("T")[0] ?? "—",
          ]
        );

        return textResult(
          `# Forum Topics\n\n${mdTable(["Title", "Author", "Replies", "Date"], rows)}`
        );
      } catch (e) {
        return errorResult(
          `Failed to fetch forum topics: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    },
  };
}
