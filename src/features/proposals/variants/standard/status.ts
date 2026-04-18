import type { ProposalStatus } from "@/lib/proposalUtils/proposalStatus";
import type {
  ParsedProposalData,
  ParsedProposalResults,
} from "@/lib/proposalUtils";

import { getProposalCurrentQuorum } from "@/lib/proposalUtils";

export function getStandardProposalStatus({
  proposalResults,
  proposalData,
  quorum,
  approvalThreshold,
}: {
  proposalResults:
    | ParsedProposalResults["STANDARD"]
    | ParsedProposalResults["OFFCHAIN_STANDARD"];
  proposalData:
    | ParsedProposalData["STANDARD"]
    | ParsedProposalData["OFFCHAIN_STANDARD"];
  quorum: bigint | null;
  approvalThreshold: bigint | null;
}): ProposalStatus {
  const { for: forVotes, against: againstVotes } = proposalResults.kind;
  const calculationOptions = proposalData.kind.calculationOptions;
  const thresholdVotes = BigInt(forVotes) + BigInt(againstVotes);
  const voteThresholdPercent =
    Number(thresholdVotes) > 0
      ? (Number(forVotes) / Number(thresholdVotes)) * 100
      : 0;
  const apprThresholdPercent = Number(approvalThreshold) / 100;

  const hasMetThresholdOrNoThreshold =
    Boolean(voteThresholdPercent >= apprThresholdPercent) ||
    approvalThreshold === undefined;

  const quorumForGovernor = getProposalCurrentQuorum(
    proposalResults.kind,
    calculationOptions
  );

  if (
    (quorum && quorumForGovernor < quorum) ||
    forVotes < againstVotes ||
    !hasMetThresholdOrNoThreshold
  ) {
    return "DEFEATED";
  }

  if (forVotes > againstVotes) {
    return "SUCCEEDED";
  }

  return "FAILED";
}

export function getHybridStandardProposalStatus({
  tallies,
}: {
  tallies: { quorumMet: boolean };
}): ProposalStatus {
  return tallies.quorumMet ? "SUCCEEDED" : "DEFEATED";
}
