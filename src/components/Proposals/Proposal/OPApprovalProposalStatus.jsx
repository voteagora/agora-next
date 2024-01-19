import { HStack, VStack } from "@/components/Layout/Stack";
import styles from "./proposal.module.scss";
import { pluralize } from "@/lib/utils";

export default function OPApprovalProposalStatus({ proposal }) {
  const maxOptions = proposal.proposalData.proposalSettings.maxApprovals;
  return (
    <VStack alignItems="items-end">
      <div className={styles.cell_content_title}>Select {maxOptions} of</div>
      <HStack className={styles.proposal_status} gap={1}>
        {pluralize("Option", proposal.proposalData.options.length)}
      </HStack>
    </VStack>
  );
}
