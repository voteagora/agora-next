// Use client for local timezone instead of server timezone
"use client";

import { HStack } from "@/components/Layout/Stack";
import { formatDistanceToNowStrict } from "date-fns";

export default function ProposalTimeStatus({
  proposalStatus,
  proposalEndTime,
}) {
  const options = {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
  };

  const activeProposalEndTime = new Intl.DateTimeFormat(
    "en-US",
    options
  ).format(proposalEndTime);

  switch (proposalStatus) {
    case "PENDING":
      return <HStack gap={1}>Voting</HStack>;

    case "ACTIVE":
      return <HStack gap={1}>Ends {activeProposalEndTime}</HStack>;

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
