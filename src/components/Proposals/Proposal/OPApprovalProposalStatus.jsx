import { HStack } from "@/components/Layout/Stack";
import styles from "./proposal.module.scss";
import { pluralize } from "@/lib/utils";

export default function OPApprovalProposalStatus({ proposal }) {
  console.log(proposal.description);
  console.log(proposal.proposalData);
  return (
    <HStack className={styles.proposal_status} gap={1}>
      {pluralize("Choice", proposal.proposalData.options.length)}
    </HStack>
  );
}
