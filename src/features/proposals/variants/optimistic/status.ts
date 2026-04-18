import type { ProposalStatus } from "@/lib/proposalUtils/proposalStatus";

export function getOptimisticProposalStatus({
  againstVotes,
  votableSupply,
}: {
  againstVotes: bigint;
  votableSupply: bigint;
}): ProposalStatus {
  return againstVotes > votableSupply / 2n ? "DEFEATED" : "SUCCEEDED";
}

export function getTieredOptimisticProposalStatus({
  vetoThresholdMet,
}: {
  vetoThresholdMet: boolean;
}): ProposalStatus {
  return vetoThresholdMet ? "DEFEATED" : "SUCCEEDED";
}
