// Use client for local timezone instead of server timezone
"use client";

import { HStack } from "@/components/Layout/Stack";
import { format } from "date-fns";

export default function ProposalTimeStatus({
  proposalStatus,
  proposalEndTime,
  proposalStartTime,
  proposalCancelledTime,
  proposalExecutedTime,
}) {
  const activeProposalEndTime = proposalEndTime
    ? format(proposalEndTime, "h:mm aaa MMM dd, yyyy")
    : null;
  const pendingProposalStartTime = proposalStartTime
    ? format(proposalStartTime, "h:mm aaa MMM dd, yyyy")
    : null;
  const _proposalCancelledTime = proposalCancelledTime
    ? format(proposalCancelledTime, "h:mm aaa MMM dd, yyyy")
    : null;
  const finishProposalEndTime = proposalEndTime
    ? format(proposalEndTime, "h:mm aaa MMM dd, yyyy")
    : null;

  const _proposalExecutedTime =
    proposalExecutedTime &&
    new Intl.DateTimeFormat("en-US", finishOptions).format(
      proposalExecutedTime
    );

  switch (proposalStatus) {
    case "PENDING":
      return <HStack gap={1}>Starts {pendingProposalStartTime}</HStack>;

    case "ACTIVE":
      return <HStack gap={1}>Ends {activeProposalEndTime}</HStack>;

    case "CANCELLED":
      return <HStack gap={1}>Cancelled {_proposalCancelledTime}</HStack>;

    case "EXECUTED":
      return <HStack gap={1}>Executed {_proposalExecutedTime}</HStack>;

    default:
      return <HStack gap={1}>Ended {finishProposalEndTime}</HStack>;
  }
}
