import { VStack } from "@/components/Layout/Stack";
import { Proposal } from "@/app/api/common/proposals/proposal";

export default function SnapshotProposalStatus({
  proposal,
}: {
  proposal: Proposal;
}) {
  return (
    <VStack className="text-right">
      <p>{(proposal.proposalData as any).scores.length} Choices</p>
    </VStack>
  );
}
