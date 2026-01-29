import ProposalDescription from "../ProposalDescription/ProposalDescription";
import { Proposal } from "@/app/api/common/proposals/proposal";
import ArchiveApprovalVotesPanel from "./ApprovalVotesPanel/ArchiveApprovalVotesPanel";
import ArchiveProposalTypeApproval from "../OPProposalPage/ArchiveProposalTypeApproval";

export default function ArchiveApprovalProposalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex gap-0 md:gap-16 justify-between items-start max-w-[76rem] flex-col sm:flex-row sm:items-start sm:justify-between">
        <div className="w-full proposal-description pb-6 md:pb-0">
          <ProposalDescription proposal={proposal} />
        </div>
        <div className="w-full md:max-w-[24rem]">
          <ArchiveProposalTypeApproval proposal={proposal} />
          <div className="flex flex-col gap-4 sticky top-20 flex-shrink bg-neutral border-line border rounded-xl shadow-newDefault mb-8 items-stretch sm:items-start justify-end sm:justify-between w-full max-h-none h-auto">
            <div className="flex flex-col gap-4 w-full">
              <ArchiveApprovalVotesPanel proposal={proposal} />
            </div>
          </div>
        </div>
      </div>
      <div className="block md:hidden" style={{ height: 65 }} />
    </div>
  );
}
