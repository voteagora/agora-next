/*
 * TanStack Start port of src/app/api/proposals/[proposalId]/votes-csv/route.ts.
 * URL: GET /api/proposals/:proposalId/votes-csv
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/proposals/$proposalId/votes-csv")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ params }) => {
        const { fetchProposalUnstableCache } = await import(
          "@/app/api/common/proposals/getProposals"
        );
        const { fetchSnapshotVotesForProposal } = await import(
          "@/app/api/common/votes/getVotes"
        );

        try {
          const [proposal, snapshotVotes] = await Promise.all([
            fetchProposalUnstableCache(params.proposalId),
            fetchSnapshotVotesForProposal({
              proposalId: params.proposalId,
              pagination: { offset: 0, limit: 100000 },
            }),
          ]);

          const choices = (proposal.proposalData as { choices: string[] })
            .choices;

          let csvContent = "Voter Address,Voting Power,Choice Ranking\n";

          snapshotVotes.data.forEach((vote) => {
            const parsedChoice = vote.choice?.startsWith("[")
              ? JSON.parse(vote.choice)
              : vote.choice;

            const ranking = (parsedChoice as number[])
              .map((rank) => choices[rank - 1])
              .join(",");

            csvContent += `${vote.address},${vote.votingPower},"${ranking}"\n`;
          });

          return new Response(csvContent, {
            headers: {
              "Content-Type": "text/csv",
              "Content-Disposition": `attachment; filename="votes-${params.proposalId}-${Date.now()}.csv"`,
            },
          });
        } catch (e: unknown) {
          return new Response("Internal server error: " + String(e), {
            status: 500,
          });
        }
      }),
    },
  },
});
