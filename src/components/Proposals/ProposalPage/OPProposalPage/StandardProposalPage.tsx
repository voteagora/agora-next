import ProposalDescription from "../ProposalDescription/ProposalDescription";
import { Proposal } from "@/app/api/common/proposals/proposal";
import {
  fetchProposalVotes,
  fetchVotersWhoHaveNotVotedForProposal,
} from "@/app/proposals/actions";
import ProposalVotesCard from "./ProposalVotesCard/ProposalVotesCard";
import { ProposalStateAdmin } from "@/app/proposals/components/ProposalStateAdmin";

export default async function StandardProposalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  const proposalVotes = await fetchProposalVotes(proposal.id, {
    limit: 250,
    offset: 0,
  });
  const nonVoters = await fetchVotersWhoHaveNotVotedForProposal(proposal.id);

  return (
    <div className="flex flex-col">
      <ProposalStateAdmin proposal={proposal} />
      <div className="flex gap-16 justify-between items-start max-w-[76rem] flex-col sm:flex-row sm:items-start sm:justify-between">
        <ProposalDescription
          proposalVotes={proposalVotes}
          proposal={proposal}
        />
        <div>
          <ProposalVotesCard
            proposal={proposal}
            proposalVotes={proposalVotes}
            nonVoters={nonVoters}
          />
        </div>
      </div>
    </div>
  );
}
