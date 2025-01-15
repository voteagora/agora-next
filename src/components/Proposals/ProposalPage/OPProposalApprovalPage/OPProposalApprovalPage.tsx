import ProposalDescription from "../ProposalDescription/ProposalDescription";
import ApprovalVotesPanel from "./ApprovalVotesPanel/ApprovalVotesPanel";
import { fetchAllForVoting as apiFetchAllForVoting } from "@/app/api/votes/getVotes";
import { Proposal } from "@/app/api/common/proposals/proposal";
import {
  fetchUserVotesForProposal as apiFetchUserVotesForProposal,
  fetchVotesForProposal,
} from "@/app/api/common/votes/getVotes";
import { PaginationParams } from "@/app/lib/pagination";
import { fetchVotersWhoHaveNotVotedForProposal } from "@/app/proposals/actions";
import { ProposalStateAdmin } from "@/app/proposals/components/ProposalStateAdmin";

async function fetchProposalVotes(
  proposalId: string,
  pagination?: PaginationParams
) {
  "use server";

  return fetchVotesForProposal({
    proposalId,
    pagination,
  });
}

async function fetchAllForVoting(
  address: string | `0x${string}`,
  blockNumber: number,
  proposalId: string
) {
  "use server";

  return await apiFetchAllForVoting(address, blockNumber, proposalId);
}

async function fetchUserVotesForProposal(
  proposalId: string,
  address: string | `0x${string}`
) {
  "use server";

  return await apiFetchUserVotesForProposal({
    proposalId,
    address,
  });
}

export default async function OPProposalApprovalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  const [proposalVotes, nonVoters] = await Promise.all([
    fetchProposalVotes(proposal.id, {
      limit: 250,
      offset: 0,
    }),
    fetchVotersWhoHaveNotVotedForProposal(proposal.id),
  ]);

  return (
    // 2 Colum Layout: Description on left w/ transactions and Votes / voting on the right
    <div className="flex flex-col">
      <ProposalStateAdmin proposal={proposal} />

      <div className="flex gap-16 justify-between items-start max-w-[76rem] flex-col sm:flex-row sm:items-start sm:justify-between">
        <ProposalDescription proposal={proposal} />
        <div>
          <div className="flex flex-col gap-4 sticky top-20 flex-shrink max-w-[24rem] bg-neutral border-line border rounded-xl shadow-newDefault mb-8 items-stretch sm:items-start justify-end sm:justify-between w-full max-h-none h-auto">
            <div className="flex flex-col gap-4 w-full">
              {/* Show the results of the approval vote w/ a tab for votes */}
              <ApprovalVotesPanel
                proposal={proposal}
                initialProposalVotes={proposalVotes}
                nonVoters={nonVoters}
                fetchVotesForProposal={fetchProposalVotes}
                fetchAllForVoting={fetchAllForVoting}
                fetchUserVotesForProposal={fetchUserVotesForProposal}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
