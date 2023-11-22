import HumanAddress from "@/components/shared/HumanAddress";
import styles from "./proposalTitle.module.scss";
import { VStack } from "@/components/Layout/Stack";

export default function ProposalTitle({ title, proposerAddress }) {
  console.log("Proposer", proposerAddress);
  return (
    <VStack className={styles.proposal_title_container}>
      <h2>{title}</h2>
      <div className={styles.proposal_proposer}>
        by &nbsp;
        <HumanAddress address={proposerAddress} />
      </div>
    </VStack>
  );
}
