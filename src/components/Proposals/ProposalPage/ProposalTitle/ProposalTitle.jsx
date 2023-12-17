import HumanAddress from "@/components/shared/HumanAddress";
import styles from "./proposalTitle.module.scss";
import { VStack } from "@/components/Layout/Stack";

export default function ProposalTitle({ title, proposerAddress }) {
  return (
    <VStack className={styles.proposal_title_container}>
      <h2>{title}</h2>
      <div className={styles.proposal_proposer}>
        {/* Warning: this assumes OP FND is the only proposer. Will need to maintain an array of OP Foundation proposals eventually */}
        by Optimism Foundation
        {/* <HumanAddress address={proposerAddress} /> */}
      </div>
    </VStack>
  );
}
