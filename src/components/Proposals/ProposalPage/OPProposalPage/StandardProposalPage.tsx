import { HStack } from "@/components/Layout/Stack";
import ProposalDescription from "../ProposalDescription/ProposalDescription";
import styles from "./StandardProposalPage.module.scss";
import { Proposal } from "@/app/api/common/proposals/proposal";
import StandardProposalDelete from "./StandardProposalDelete";
import { fetchProposalVotes } from "@/app/proposals/actions";
import ProposalVotesCard from "./ProposalVotesCard/ProposalVotesCard";

export default async function StandardProposalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  const proposalVotes = await fetchProposalVotes(proposal.id);

  return (
    // 2 Colum Layout: Description on left w/ transactions and Votes / voting on the right
    <HStack
      gap={16}
      justifyContent="justify-between"
      alignItems="items-start"
      className={styles.proposal_container}
    >
      <ProposalDescription proposal={proposal} />
      <div>
        <StandardProposalDelete proposal={proposal} />
        <ProposalVotesCard proposal={proposal} proposalVotes={proposalVotes} />
      </div>
    </HStack>
  );
}
