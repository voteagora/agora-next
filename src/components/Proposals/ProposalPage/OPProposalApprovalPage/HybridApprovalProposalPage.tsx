import ProposalDescription from "../ProposalDescription/ProposalDescription";
import HybridApprovalVotesPanel from "./ApprovalVotesPanel/HybridApprovalVotesPanel";
import { Proposal } from "@/app/api/common/proposals/proposal";
import {
  fetchUserVotesForProposal as apiFetchUserVotesForProposal,
  fetchVotesForProposal,
} from "@/app/api/common/votes/getVotes";
import { PaginationParams } from "@/app/lib/pagination";
import { ProposalStateAdmin } from "@/app/proposals/components/ProposalStateAdmin";

// async function fetchProposalVotes(
//   proposalId: string,
//   pagination?: PaginationParams
// ) {
//   "use server";

//   return fetchVotesForProposal({
//     proposalId,
//     pagination,
//   });
// }

// async function fetchUserVotesForProposal(
//   proposalId: string,
//   address: string | `0x${string}`
// ) {
//   "use server";

//   return await apiFetchUserVotesForProposal({
//     proposalId,
//     address,
//   });
// }

export default async function HybridApprovalProposalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  return (
    // 2 Colum Layout: Description on left w/ transactions and Votes / voting on the right
    <div className="flex flex-col">
      <ProposalStateAdmin proposal={proposal} />

      <div className="flex gap-16 justify-between items-start max-w-[76rem] flex-col sm:flex-row sm:items-start sm:justify-between">
        <ProposalDescription proposal={proposal} />
        <div>
          <HybridApprovalVotesPanel proposal={proposal} />
        </div>
      </div>
    </div>
  );
}
