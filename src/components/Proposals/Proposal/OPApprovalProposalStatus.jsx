import { HStack, VStack } from "@/components/Layout/Stack";
import { pluralize } from "@/lib/utils";

export default function OPApprovalProposalStatus({ proposal }) {
  const maxOptions = proposal.proposalData.proposalSettings.maxApprovals;
  return (
    <VStack alignItems="items-end">
      <div className="text-xs text-secondary">Select {maxOptions} of</div>
      <HStack gap={1}>
        {pluralize("Option", proposal.proposalData.options.length)}
      </HStack>
    </VStack>
  );
}
