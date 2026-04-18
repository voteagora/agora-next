export function parseOptimisticProposalData(proposalData: string) {
  const parsedProposalData = JSON.parse(proposalData);
  const disapprovalThreshold =
    Number(parsedProposalData?.[0]?.[0] || 2000) / 100;

  return {
    key: "OPTIMISTIC" as const,
    kind: { options: [] as [], disapprovalThreshold },
  };
}

export function parseHybridOptimisticProposalData() {
  return {
    key: "HYBRID_OPTIMISTIC" as const,
    kind: { options: [] as [] },
  };
}

export function parseTieredOptimisticProposalData(
  proposalData: string,
  proposalType:
    | "HYBRID_OPTIMISTIC_TIERED"
    | "OFFCHAIN_OPTIMISTIC_TIERED"
    | "OFFCHAIN_OPTIMISTIC",
  offChainProposalData?: any
) {
  const parsedProposalData = JSON.parse(proposalData);

  if (proposalType === "HYBRID_OPTIMISTIC_TIERED") {
    return {
      key: proposalType,
      kind: {
        options: [] as [],
        tiers: offChainProposalData?.tiers
          .map((tier: number) => tier / 100)
          .sort((a: number, b: number) => b - a),
        created_attestation_hash: parsedProposalData.created_attestation_hash,
        cancelled_attestation_hash:
          parsedProposalData.cancelled_attestation_hash,
      },
    };
  }

  if (proposalType === "OFFCHAIN_OPTIMISTIC_TIERED") {
    return {
      key: proposalType,
      kind: {
        options: [] as [],
        tiers: parsedProposalData.tiers
          ?.map((tier: number) => tier / 100)
          .sort((a: number, b: number) => b - a),
        onchainProposalId: parsedProposalData.onchain_proposalid,
        created_attestation_hash: parsedProposalData.created_attestation_hash,
        cancelled_attestation_hash:
          parsedProposalData.cancelled_attestation_hash,
      },
    };
  }

  return {
    key: proposalType,
    kind: {
      options: [] as [],
      onchainProposalId: parsedProposalData.onchain_proposalid,
      created_attestation_hash: parsedProposalData.created_attestation_hash,
      cancelled_attestation_hash: parsedProposalData.cancelled_attestation_hash,
    },
  };
}
