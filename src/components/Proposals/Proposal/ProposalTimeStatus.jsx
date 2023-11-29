import { HStack } from "@/components/Layout/Stack";
import { formatDistanceToNow } from "date-fns";

export default function ProposalTimeStatus({
  proposalStatus,
  proposalEndTime,
}) {
  switch (proposalStatus) {
    case "PENDING":
      return "Voting";

    case "ACTIVE":
      return (
        <HStack gap={1}>
          Voting ends in {formatDistanceToNow(proposalEndTime)}
        </HStack>
      );

    default:
      return (
        <HStack gap={1}>
          Voting ended {formatDistanceToNow(proposalEndTime)} ago
        </HStack>
      );
  }
}
