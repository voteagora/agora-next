import ProposalDescription from "../ProposalDescription/ProposalDescription";
import { ProposalStateAdmin } from "@/app/proposals/components/ProposalStateAdmin";
import OptimisticTieredProposalVotesCard from "@/components/Proposals/ProposalPage/OPProposalPage/ProposalVotesCard/OptimisticTieredProposalVotesCard";
import { Proposal } from "@/app/api/common/proposals/proposal";
import OffChainOptimisticProposalVotesCard from "./ProposalVotesCard/OffChainOptimisticProposalVotesCard";
import { TaxFormBanner } from "../TaxFormBanner";

export default async function HybridOptimisticProposalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  return (
    <div className="flex flex-col">
      <TaxFormBanner proposal={proposal} />
      <ProposalStateAdmin proposal={proposal} />
      <div className="flex gap-16 justify-between items-start max-w-[76rem] flex-col md:flex-row md:items-start md:justify-between">
        <ProposalDescription proposal={proposal} />
        <div>
          {proposal.proposalType === "HYBRID_OPTIMISTIC_TIERED" ? (
            <OptimisticTieredProposalVotesCard proposal={proposal} />
          ) : (
            <OffChainOptimisticProposalVotesCard proposal={proposal} />
          )}
        </div>
      </div>
    </div>
  );
}
