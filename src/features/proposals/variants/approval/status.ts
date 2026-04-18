import type { ProposalStatus } from "@/lib/proposalUtils/proposalStatus";
import type { ParsedProposalResults } from "@/lib/proposalUtils";

export function getApprovalProposalStatus({
  proposalResults,
  quorum,
}: {
  proposalResults: ParsedProposalResults["APPROVAL"];
  quorum: bigint | null;
}): ProposalStatus {
  const { for: forVotes, abstain: abstainVotes } = proposalResults.kind;
  const proposalQuorumVotes = forVotes + abstainVotes;

  if (quorum && proposalQuorumVotes < quorum) {
    return "DEFEATED";
  }

  if (proposalResults.kind.criteria === "THRESHOLD") {
    for (const option of proposalResults.kind.options) {
      if (option.votes > proposalResults.kind.criteriaValue) {
        return "SUCCEEDED";
      }
    }

    return "DEFEATED";
  }

  return "SUCCEEDED";
}

export function getOffchainApprovalProposalStatus({
  proposalResults,
  quorum,
}: {
  proposalResults: ParsedProposalResults["OFFCHAIN_APPROVAL"];
  quorum: bigint | null;
}): ProposalStatus {
  const { for: forVotes, abstain: abstainVotes } = proposalResults.kind;
  const proposalQuorumVotes = forVotes + abstainVotes;

  if (quorum && proposalQuorumVotes < quorum) {
    return "DEFEATED";
  }

  return "SUCCEEDED";
}

export function getHybridApprovalProposalStatus({
  proposalResults,
  metrics,
}: {
  proposalResults: ParsedProposalResults["HYBRID_APPROVAL"];
  metrics: {
    quorumMet: boolean;
    thresholdMet: boolean;
  };
}): ProposalStatus {
  if (!metrics.quorumMet) {
    return "DEFEATED";
  }

  if (proposalResults.kind.criteria === "THRESHOLD") {
    return metrics.thresholdMet ? "SUCCEEDED" : "DEFEATED";
  }

  return "SUCCEEDED";
}
