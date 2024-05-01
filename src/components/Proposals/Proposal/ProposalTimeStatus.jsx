// Use client for local timezone instead of server timezone
"use client";

import { HStack } from "@/components/Layout/Stack";

export default function ProposalTimeStatus({
  proposalStatus,
  proposalEndTime,
  proposalStartTime,
  proposalCancelledTime,
}) {
  const activeOptions = {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
  };

  const activeProposalEndTime = new Intl.DateTimeFormat(
    "en-US",
    activeOptions
  ).format(proposalEndTime);

  const pendingOptions = {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
  };

  const pendingProposalStartTime = new Intl.DateTimeFormat(
    "en-US",
    pendingOptions
  ).format(proposalStartTime);

  const finishOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };

  const finishProposalEndTime = new Intl.DateTimeFormat(
    "en-US",
    finishOptions
  ).format(proposalEndTime);

  const _proposalCancelledTime = new Intl.DateTimeFormat(
    "en-US",
    finishOptions
  ).format(proposalCancelledTime);

  switch (proposalStatus) {
    case "PENDING":
      return <HStack gap={1}>Starts {pendingProposalStartTime}</HStack>;

    case "ACTIVE":
      return <HStack gap={1}>Ends {activeProposalEndTime}</HStack>;

    case "CANCELLED":
      return <HStack gap={1}>Cancelled {_proposalCancelledTime}</HStack>;

    default:
      return <HStack gap={1}>Ended {finishProposalEndTime}</HStack>;
  }
}
