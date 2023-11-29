import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalDescription from "../ProposalDescription/ProposalDescription";
import styles from "./OPProposalPage.module.scss";
import ProposalVotesSummary from "./ProposalVotesSummary/ProposalVotesSummary";
import ProposalVotesList from "@/components/Votes/ProposalVotesList/ProposalVotesList";
import { getVotesForProposal } from "@/app/api/votes/getVotes";

async function fetchProposalVotes(proposal_id, page = 1) {
  "use server";

  return getVotesForProposal({ proposal_id, page });
}

export default async function OPProposalPage({ proposal }) {
  const proposalVotes = await fetchProposalVotes(proposal.id);
  return (
    <HStack
      gap={16}
      justifyContent="justify-between"
      alignItems="items-start"
      className={styles.proposal_description_container}
    >
      <ProposalDescription proposal={proposal} />
      <VStack
        justifyContent="space-between"
        className={styles.proposal_votes_container}
      >
        <VStack gap={4} className={styles.proposal_actions_panel}>
          <ProposalVotesSummary proposal={proposal} />
          <ProposalVotesList
            initialProposalVotes={proposalVotes}
            fetchVotesForProposal={fetchProposalVotes}
            proposal_id={proposal.id}
          />
        </VStack>
      </VStack>
    </HStack>
  );
}
