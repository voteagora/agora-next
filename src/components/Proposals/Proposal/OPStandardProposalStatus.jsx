import { HStack } from "@/components/Layout/Stack";
import styles from "./proposal.module.scss";
import { TokenAmountDisplay } from "@/lib/utils";

export default function OPStandardProposalStatus({ proposal }) {
  return (
    <HStack className={styles.proposal_status} gap={1}>
      <span>
        {TokenAmountDisplay(proposal.proposalResults.for, 18, "OP")} For
      </span>
      <span>-</span>
      <span>
        {TokenAmountDisplay(proposal.proposalResults.against, 18, "OP")} Against
      </span>
    </HStack>
  );
}
