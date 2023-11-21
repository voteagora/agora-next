import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalResults from "../ProposalResults";
import ProposalDescription from "../ProposalDescription/ProposalDescription";
import { ProposalVotes } from "../ProposalVotes";
import styles from "./OPProposalApprovalPage.module.scss";

export default function OPProposalApprovalPage({ proposal }) {
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
        APPROVAL VOTES
      </VStack>
    </HStack>
  );
}
