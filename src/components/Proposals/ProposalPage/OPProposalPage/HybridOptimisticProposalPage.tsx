import ProposalDescription from "../ProposalDescription/ProposalDescription";
import { ProposalStateAdmin } from "@/app/proposals/components/ProposalStateAdmin";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { TaxFormBanner } from "../TaxFormBanner";
import { getHybridOptimisticVotesCardComponent } from "./ProposalVotesCard/registry";

export default async function HybridOptimisticProposalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  const ProposalVotesCard = getHybridOptimisticVotesCardComponent(proposal);

  return (
    <div className="flex flex-col">
      <TaxFormBanner proposal={proposal} />
      <ProposalStateAdmin proposal={proposal} />
      <div className="flex gap-16 justify-between items-start max-w-[76rem] flex-col md:flex-row md:items-start md:justify-between">
        <ProposalDescription proposal={proposal} />
        <div>
          {ProposalVotesCard ? <ProposalVotesCard proposal={proposal} /> : null}
        </div>
      </div>
    </div>
  );
}
