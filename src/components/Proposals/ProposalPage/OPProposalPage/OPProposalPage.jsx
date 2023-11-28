import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalDescription from "../ProposalDescription/ProposalDescription";
import styles from "./OPProposalPage.module.scss";
import ProposalVotesSummary from "./ProposalVotesSummary/ProposalVotesSummary";

export default function OPProposalPage({ proposal }) {
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
        </VStack>
      </VStack>
    </HStack>
  );
}
