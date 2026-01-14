import ProposalDescription from "../ProposalDescription/ProposalDescription";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { ProposalStateAdmin } from "@/app/proposals/components/ProposalStateAdmin";
import HybridStandardProposalVotesCard from "./ProposalVotesCard/HybridStandardProposalVotesCard";
import { TaxFormBanner } from "../TaxFormBanner";

export default async function HybridStandardProposalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  return (
    <div className="flex flex-col">
      <TaxFormBanner proposal={proposal} />
      <ProposalStateAdmin proposal={proposal} />
      <div className="flex gap-8 lg:gap-16 justify-between items-start max-w-[76rem] flex-col md:flex-row md:items-start md:justify-between">
        <ProposalDescription proposal={proposal} />
        <div>
          <HybridStandardProposalVotesCard proposal={proposal} />
        </div>
      </div>
    </div>
  );
}
