import ProposalDescription from "../ProposalDescription/ProposalDescription";
import ApprovalVotesPanel from "./ApprovalVotesPanel/ApprovalVotesPanel";
import { Proposal } from "@/lib/types/proposal";
import { ProposalStateAdmin } from "@/app/proposals/components/ProposalStateAdmin";
import {
  fetchProposalVotes,
  fetchUserVotesForProposal as fetchUserVotes,
} from "@/server/proposals/votes";
import { TaxFormBanner } from "../TaxFormBanner";

export default function OPProposalApprovalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  return (
    // 2 Colum Layout: Description on left w/ transactions and Votes / voting on the right
    <div className="flex flex-col">
      <TaxFormBanner proposal={proposal} />
      <ProposalStateAdmin proposal={proposal} />

      <div className="flex gap-0 md:gap-16 justify-between items-start max-w-[76rem] flex-col sm:flex-row sm:items-start sm:justify-between">
        <div className="w-full proposal-description pb-6 md:pb-0">
          <ProposalDescription proposal={proposal} />
        </div>
        <div className="w-full md:max-w-[24rem]">
          <div className="flex flex-col gap-4 sticky top-20 flex-shrink bg-neutral border-line border rounded-xl shadow-newDefault mb-8 items-stretch sm:items-start justify-end sm:justify-between w-full max-h-none h-auto">
            <div className="flex flex-col gap-4 w-full">
              {/* Show the results of the approval vote w/ a tab for votes */}
              <ApprovalVotesPanel
                proposal={proposal}
                fetchVotesForProposal={fetchProposalVotes}
                fetchUserVotes={fetchUserVotes}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Mobile-only spacer to prevent overlap with modal/circle */}
      <div className="block md:hidden" style={{ height: 65 }} />
    </div>
  );
}
