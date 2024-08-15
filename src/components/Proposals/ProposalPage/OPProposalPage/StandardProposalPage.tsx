import ProposalDescription from "../ProposalDescription/ProposalDescription";
import { Proposal } from "@/app/api/common/proposals/proposal";
import StandardProposalDelete from "./StandardProposalDelete";
import { fetchProposalVotes } from "@/app/proposals/actions";
import ProposalVotesCard from "./ProposalVotesCard/ProposalVotesCard";
import Tenant from "@/lib/tenant/tenant";
import { ProposalStateAdmin } from "@/app/proposals/components/ProposalStateAdmin";

export default async function StandardProposalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  const { contracts, ui } = Tenant.current();

  // TODO: Replace with governor-level check
  const isAlligator = Boolean(contracts?.alligator);
  const proposalVotes = await fetchProposalVotes(proposal.id);

  return (
    <div className="flex flex-col">
      <ProposalStateAdmin proposal={proposal} />
      <div className="flex gap-16 justify-between items-start max-w-[76rem] flex-col sm:flex-row sm:items-start sm:justify-between">
        <ProposalDescription
          proposalVotes={proposalVotes}
          proposal={proposal}
        />
        <div>
          {isAlligator && <StandardProposalDelete proposal={proposal} />}
          <ProposalVotesCard
            proposal={proposal}
            proposalVotes={proposalVotes}
          />
        </div>
      </div>
    </div>
  );
}
