/*
 * TanStack Start port of src/app/api/embeds/proposal/[proposalId]/route.ts.
 * URL: GET /api/embeds/proposal/:proposalId
 * Note: unstable_cache removed; responses rely on HTTP Cache-Control.
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/embeds/proposal/$proposalId")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ params }) => {
        const { fetchProposal } = await import(
          "@/app/api/common/proposals/getProposals"
        );
        const { default: Tenant } = await import("@/lib/tenant/tenant");
        const { formatNumber } = await import("@/lib/tokenUtils");
        const { fetchProposalFromArchive } = await import("@/lib/archiveUtils");
        const { isArchiveStandardProposal, normalizeArchiveStandardProposal } =
          await import(
            "@/components/Proposals/Proposal/Archive/normalizeArchiveProposalDetail"
          );

        try {
          const { proposalId } = params;

          if (!proposalId) {
            return Response.json(
              { error: "Proposal ID is required" },
              { status: 400 }
            );
          }

          const { namespace, token, ui } = Tenant.current();
          const useArchive = ui.toggle(
            "use-archive-for-proposal-details"
          )?.enabled;

          let proposal;
          if (useArchive) {
            const archiveResults = await fetchProposalFromArchive(
              namespace,
              proposalId
            );
            if (archiveResults && isArchiveStandardProposal(archiveResults)) {
              proposal = normalizeArchiveStandardProposal(archiveResults, {
                namespace,
                tokenDecimals: token.decimals ?? 18,
              });
            } else {
              throw new Error("Proposal not found in archive");
            }
          } else {
            proposal = await fetchProposal(proposalId);
          }

          const title =
            proposal.markdowntitle ||
            proposal.description?.split("\n")[0] ||
            "Proposal";

          let voteStats = undefined;
          if (proposal.proposalResults) {
            const results = proposal.proposalResults as Record<string, unknown>;
            if (results.for !== undefined && results.against !== undefined) {
              const forVotes = BigInt(String(results.for || "0"));
              const againstVotes = BigInt(String(results.against || "0"));
              const abstainVotes = BigInt(String(results.abstain || "0"));
              const totalVotes = forVotes + againstVotes + abstainVotes;

              if (totalVotes > 0n) {
                voteStats = {
                  for: formatNumber(forVotes),
                  against: formatNumber(againstVotes),
                  abstain: formatNumber(abstainVotes),
                  forRaw: forVotes.toString(),
                  againstRaw: againstVotes.toString(),
                  abstainRaw: abstainVotes.toString(),
                  forPercentage: Number((forVotes * 100n) / totalVotes),
                  againstPercentage: Number((againstVotes * 100n) / totalVotes),
                  abstainPercentage: Number((abstainVotes * 100n) / totalVotes),
                  quorum: proposal.quorum
                    ? formatNumber(proposal.quorum)
                    : undefined,
                };
              }
            }
          }

          const embedData = {
            id: proposal.id,
            title: title.replace(/^#+\s*/, ""),
            status: proposal.status || "UNKNOWN",
            proposer: proposal.proposer,
            proposalType: proposal.proposalType || "Standard",
            voteStats,
            startTime: proposal.startTime?.toISOString(),
            endTime: proposal.endTime?.toISOString(),
            url: `/proposals/${proposal.id}`,
          };

          return new Response(JSON.stringify(embedData), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control":
                "public, s-maxage=300, stale-while-revalidate=600",
            },
          });
        } catch (error) {
          console.error("Error fetching proposal embed data:", error);
          return Response.json(
            { error: "Failed to fetch proposal data" },
            { status: 500 }
          );
        }
      }),
    },
  },
});
