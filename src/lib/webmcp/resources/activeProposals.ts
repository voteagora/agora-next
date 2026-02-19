import type { ResourceDefinition } from "../types";
import { mdTable, mdStatus, formatAddress } from "../utils/formatters";

export function createActiveProposalsResource(
  baseUrl: string,
  daoName: string
): ResourceDefinition {
  return {
    name: "active-proposals",
    description: `Currently active governance proposals in the ${daoName} DAO.`,
    uri: "dao://active-proposals",
    mimeType: "text/markdown",
    handler: async (uri) => {
      let text = `# Active Proposals — ${daoName}\n\nNo active proposals found.`;

      try {
        const res = await fetch(
          `${baseUrl}/api/v1/proposals?filter=relevant&limit=20`
        );
        if (res.ok) {
          const data = await res.json();
          const proposals = data?.data ?? data?.proposals ?? [];

          const active = proposals.filter(
            (p: { status?: string }) =>
              p.status === "ACTIVE" || p.status === "PENDING"
          );

          if (active.length) {
            const rows = active.map(
              (p: {
                id?: string;
                proposalId?: string;
                markdowntitle?: string;
                title?: string;
                status?: string;
                proposer?: string;
              }) => [
                p.id ?? p.proposalId ?? "—",
                (p.markdowntitle ?? p.title ?? "Untitled").slice(0, 50),
                mdStatus(p.status ?? "ACTIVE"),
                formatAddress(p.proposer ?? "—"),
              ]
            );

            text = `# Active Proposals — ${daoName}\n\n${mdTable(["ID", "Title", "Status", "Proposer"], rows)}`;
          }
        }
      } catch {
        /* graceful fallback */
      }

      return {
        contents: [{ uri, mimeType: "text/markdown", text }],
      };
    },
  };
}
