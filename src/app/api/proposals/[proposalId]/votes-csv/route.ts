import { NextRequest } from "next/server";
import { fetchProposalUnstableCache } from "@/app/api/common/proposals/getProposals";
import { fetchSnapshotVotesForProposal } from "@/app/api/common/votes/getVotes";
import {
  fetchProposalFromArchive,
  fetchRawProposalVotesFromArchive,
} from "@/lib/archiveUtils";
import { archiveToProposal } from "@/lib/proposals";
import { ParsedProposalData } from "@/lib/proposalUtils";
import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";

type CsvRow = {
  address: string;
  votingPower: string | number;
  ranking: string;
};

async function loadProposal(proposalId: string): Promise<Proposal> {
  const { namespace, token, ui } = Tenant.current();
  const useArchive = ui.toggle("use-archive-for-proposal-details")?.enabled;

  if (useArchive) {
    const archiveProposal = await fetchProposalFromArchive(
      namespace,
      proposalId
    );

    if (archiveProposal) {
      return await archiveToProposal(archiveProposal, {
        namespace,
        tokenDecimals: token.decimals ?? 18,
      });
    }

    throw new Error("Proposal not found in archive");
  }

  return await fetchProposalUnstableCache(proposalId);
}

async function loadVoteRows(
  proposal: Proposal,
  proposalId: string
): Promise<CsvRow[]> {
  const { namespace, ui } = Tenant.current();
  const useArchive = ui.toggle("use-archive-for-proposal-details")?.enabled;

  const choices = (
    proposal.proposalData as unknown as ParsedProposalData["SNAPSHOT"]["kind"]
  ).choices;

  if (useArchive) {
    const archiveVotes = await fetchRawProposalVotesFromArchive({
      namespace,
      proposalId,
    });

    return archiveVotes.map((vote) => ({
      address: vote.voter,
      votingPower: vote.vp ?? vote.weight ?? 0,
      ranking: (vote.choice ?? []).map((rank) => choices[rank - 1]).join(","),
    }));
  }

  const snapshotVotes = await fetchSnapshotVotesForProposal({
    proposalId,
    pagination: { offset: 0, limit: 100000 },
  });

  return snapshotVotes.data.map((vote) => {
    const parsedChoice = vote.choice?.startsWith("[")
      ? (JSON.parse(vote.choice) as number[])
      : [];

    return {
      address: vote.address,
      votingPower: vote.votingPower,
      ranking: parsedChoice.map((rank) => choices[rank - 1]).join(","),
    };
  });
}

export async function GET(
  request: NextRequest,
  route: { params: { proposalId: string } }
) {
  try {
    const proposalId = route.params.proposalId;
    const proposal = await loadProposal(proposalId);
    const rows = await loadVoteRows(proposal, proposalId);

    let csvContent = "Voter Address,Voting Power,Choice Ranking\n";
    for (const row of rows) {
      csvContent += `${row.address},${row.votingPower},"${row.ranking}"\n`;
    }

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="votes-${proposalId}-${Date.now()}.csv"`,
      },
    });
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
