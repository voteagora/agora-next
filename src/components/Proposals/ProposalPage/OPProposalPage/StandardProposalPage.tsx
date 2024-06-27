import ProposalDescription from "../ProposalDescription/ProposalDescription";
import styles from "./StandardProposalPage.module.scss";
import { Proposal } from "@/app/api/common/proposals/proposal";
import StandardProposalDelete from "./StandardProposalDelete";
import { fetchProposalVotes } from "@/app/proposals/actions";
import ProposalVotesCard from "./ProposalVotesCard/ProposalVotesCard";
import Tenant from "@/lib/tenant/tenant";

export default async function StandardProposalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  const { contracts } = Tenant.current();

  // TODO: Replace this with a check
  const isAlligator = Boolean(contracts?.alligator);
  const proposalVotes = await fetchProposalVotes(proposal.id);

  return (
    <div
      className={`flex gap-16 justify-between items-start ${styles.proposal_container}`}
    >
      <ProposalDescription proposalVotes={proposalVotes} proposal={proposal} />
      <div>
        {isAlligator && <StandardProposalDelete proposal={proposal} />}
        <ProposalVotesCard proposal={proposal} proposalVotes={proposalVotes} />
      </div>
    </div>
  );
}
