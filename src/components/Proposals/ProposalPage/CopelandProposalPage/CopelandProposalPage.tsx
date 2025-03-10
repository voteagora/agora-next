import ProposalDescription from "../ProposalDescription/ProposalDescription";
import { Proposal } from "@/app/api/common/proposals/proposal";
import CopelandVotesPanel from "./CopelandVotesPanel/CopelandVotesPanel";
import {
  fetchSnapshotVotesForProposal,
  fetchSnapshotUserVotesForProposal,
} from "@/app/api/common/votes/getVotes";
import { PaginationParams } from "@/app/lib/pagination";

async function fetchProposalVotes(
  proposalId: string,
  pagination?: PaginationParams
) {
  "use server";

  return fetchSnapshotVotesForProposal({
    proposalId,
    pagination,
  });
}

async function fetchUserVotesForProposal(
  proposalId: string,
  address: string | `0x${string}`
) {
  "use server";

  return await fetchSnapshotUserVotesForProposal({
    proposalId,
    address,
  });
}

export default async function CopelandProposalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  const proposalState = proposal.status;
  return (
    <div className="flex gap-16 justify-between items-start max-w-[76rem] flex-col sm:flex-row sm:items-start sm:justify-between">
      <div className="flex-1">
        <ProposalDescription proposal={proposal} />
      </div>
      <div className="sticky flex-none top-20 max-w-[24rem] bg-neutral border-line border rounded-xl shadow-newDefault mb-8 items-stretch sm:items-start justify-end sm:justify-between w-full max-h-none h-auto">
        <CopelandVotesPanel
          proposal={proposal}
          fetchVotesForProposal={fetchProposalVotes}
          fetchUserVotesForProposal={fetchUserVotesForProposal}
        />
        {proposalState === "CLOSED" && (
          <div className="px-4 py-2 bg-wash font-semibold text-xs text-primary rounded-b-xl mt-2 border-t border-line flex items-center">
            This proposal has ended.
          </div>
        )}
      </div>
    </div>
  );
}
