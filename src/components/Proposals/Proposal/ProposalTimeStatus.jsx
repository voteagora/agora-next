import { HStack } from "@/components/Layout/Stack";
import { formatDistanceToNowStrict } from "date-fns";

export default function ProposalTimeStatus({
  proposalStatus,
  proposalEndTime,
}) {
  switch (proposalStatus) {
    case "PENDING":
      return <HStack gap={1}>Voting</HStack>;

    case "ACTIVE":
      return (
        <HStack gap={1}>
          Ends in {formatDistanceToNowStrict(proposalEndTime)}
        </HStack>
      );

    case "CANCELLED":
      return <HStack gap={1}></HStack>;

    default:
      return (
        <HStack gap={1}>
          Ended {formatDistanceToNowStrict(proposalEndTime)} ago
        </HStack>
      );
  }
}
