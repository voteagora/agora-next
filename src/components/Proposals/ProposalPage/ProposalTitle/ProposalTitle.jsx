import HumanAddress from "@/components/shared/HumanAddress";
import styles from "./proposalTitle.module.scss";
import { VStack } from "@/components/Layout/Stack";
import { getProposalTypeText } from "@/lib/utils";

export default function ProposalTitle({
  title,
  proposalType,
  proposerAddress,
}) {
  const proposalText = getProposalTypeText(proposalType);
  return (
    <VStack className={styles.proposal_title_container}>
      <h2>{title}</h2>
      <div className={styles.proposal_proposer}>
        {/* Warning: this assumes OP FND is the only proposer. Will need to maintain an array of OP Foundation proposals eventually */}
        {proposalText} by The Optimism Foundation
        {/* <HumanAddress address={proposerAddress} /> */}
      </div>
    </VStack>
  );
}
