import type { ResourceDefinition } from "../types";
import { mdBold } from "../utils/formatters";

export function createDaoOverviewResource(
  baseUrl: string,
  daoName: string,
  tokenSymbol: string,
  namespace: string
): ResourceDefinition {
  return {
    name: "dao-overview",
    description: `Overview of the ${daoName} DAO: name, token, governance model, and key stats.`,
    uri: "dao://overview",
    mimeType: "text/markdown",
    handler: async (uri) => {
      let proposalCount = "—";
      let votableSupply = "—";

      try {
        const res = await fetch(`${baseUrl}/api/v1/proposals?limit=1`);
        if (res.ok) {
          const data = await res.json();
          proposalCount = String(
            data?.meta?.total_returned ?? data?.data?.length ?? "—"
          );
        }
      } catch {
        /* graceful fallback */
      }

      try {
        const res = await fetch(`${baseUrl}/api/v1/votable_supply`);
        if (res.ok) {
          const data = await res.json();
          votableSupply = data?.votableSupply ?? data?.votable_supply ?? "—";
        }
      } catch {
        /* graceful fallback */
      }

      const text = [
        `# ${daoName} DAO`,
        "",
        `- ${mdBold("Namespace")}: ${namespace}`,
        `- ${mdBold("Token")}: ${tokenSymbol}`,
        `- ${mdBold("Total Proposals")}: ${proposalCount}`,
        `- ${mdBold("Votable Supply")}: ${votableSupply} ${tokenSymbol}`,
        "",
        `> Powered by [Agora](https://agora.xyz)`,
      ].join("\n");

      return {
        contents: [{ uri, mimeType: "text/markdown", text }],
      };
    },
  };
}
