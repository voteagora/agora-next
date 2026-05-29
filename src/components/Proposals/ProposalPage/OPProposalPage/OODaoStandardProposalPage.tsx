import ProposalDescription from "../ProposalDescription/ProposalDescription";
import { Proposal } from "@/app/api/common/proposals/proposal";
import OODaoProposalVotesCard from "./OODaoProposalVotesCard";
import OODaoProposalTypeApproval from "./OODaoProposalTypeApproval";
import { TaxFormBanner } from "../TaxFormBanner";

export default function OODaoStandardProposalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  return (
    <div className="flex flex-col">
      <TaxFormBanner proposal={proposal} />
      <div className="flex gap-0 md:gap-16 justify-between items-start max-w-[76rem] flex-col md:flex-row md:items-start md:justify-between">
        <div className="w-full proposal-description pb-8 md:pb-0">
          <ProposalDescription proposal={proposal} />
        </div>
        <div className="w-full md:max-w-[24rem]">
          <OODaoProposalTypeApproval proposal={proposal} />
          <OODaoProposalVotesCard proposal={proposal} />
        </div>
      </div>
      <div className="block md:hidden" style={{ height: 65 }} />
    </div>
  );
}
