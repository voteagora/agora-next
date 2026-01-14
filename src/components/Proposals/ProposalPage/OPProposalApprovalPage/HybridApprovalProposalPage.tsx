import ProposalDescription from "../ProposalDescription/ProposalDescription";
import HybridApprovalVotesPanel from "./ApprovalVotesPanel/HybridApprovalVotesPanel";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { ProposalStateAdmin } from "@/app/proposals/components/ProposalStateAdmin";
import { TaxFormBanner } from "../TaxFormBanner";

export default async function HybridApprovalProposalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  return (
    // 2 Colum Layout: Description on left w/ transactions and Votes / voting on the right
    <div className="flex flex-col">
      <TaxFormBanner proposal={proposal} />
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
