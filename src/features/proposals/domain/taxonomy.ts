export type ProposalVotingKind =
  | "standard"
  | "approval"
  | "optimistic"
  | "snapshot";

export type ProposalScope = "onchain" | "offchain" | "hybrid";

export type ProposalSource =
  | "dao_node"
  | "eas-atlas"
  | "eas-oodao"
  | "snapshot"
  | "unknown";

export type ProposalMode = "basic" | "tiered";

export type LegacyProposalType =
  | "STANDARD"
  | "APPROVAL"
  | "OPTIMISTIC"
  | "SNAPSHOT"
  | "OFFCHAIN_OPTIMISTIC_TIERED"
  | "OFFCHAIN_OPTIMISTIC"
  | "OFFCHAIN_STANDARD"
  | "OFFCHAIN_APPROVAL"
  | "HYBRID_STANDARD"
  | "HYBRID_APPROVAL"
  | "HYBRID_OPTIMISTIC"
  | "HYBRID_OPTIMISTIC_TIERED";

export type ProposalKind = {
  votingKind: ProposalVotingKind;
  scope: ProposalScope;
  source: ProposalSource;
  mode?: ProposalMode;
};

const OFFCHAIN_LEGACY_PROPOSAL_TYPES = new Set<LegacyProposalType>([
  "OFFCHAIN_STANDARD",
  "OFFCHAIN_APPROVAL",
  "OFFCHAIN_OPTIMISTIC",
  "OFFCHAIN_OPTIMISTIC_TIERED",
  "SNAPSHOT",
]);

const HYBRID_LEGACY_PROPOSAL_TYPES = new Set<LegacyProposalType>([
  "HYBRID_STANDARD",
  "HYBRID_APPROVAL",
  "HYBRID_OPTIMISTIC",
  "HYBRID_OPTIMISTIC_TIERED",
]);

export function normalizeProposalSource(
  source: string | null | undefined
): ProposalSource {
  switch (source) {
    case "dao_node":
    case "eas-atlas":
    case "eas-oodao":
    case "snapshot":
      return source;
    default:
      return "unknown";
  }
}

export function isOffchainLegacyProposalType(
  proposalType: LegacyProposalType
): boolean {
  return OFFCHAIN_LEGACY_PROPOSAL_TYPES.has(proposalType);
}

export function isHybridLegacyProposalType(
  proposalType: LegacyProposalType
): boolean {
  return HYBRID_LEGACY_PROPOSAL_TYPES.has(proposalType);
}

export function isTieredLegacyProposalType(
  proposalType: LegacyProposalType
): boolean {
  return (
    proposalType === "OFFCHAIN_OPTIMISTIC_TIERED" ||
    proposalType === "HYBRID_OPTIMISTIC_TIERED"
  );
}

export function inferVotingKindFromLegacyProposalType(
  proposalType: LegacyProposalType
): ProposalVotingKind {
  if (proposalType === "SNAPSHOT") {
    return "snapshot";
  }

  if (proposalType.includes("APPROVAL")) {
    return "approval";
  }

  if (proposalType.includes("OPTIMISTIC")) {
    return "optimistic";
  }

  return "standard";
}

export function inferScopeFromLegacyProposalType(
  proposalType: LegacyProposalType
): ProposalScope {
  if (isHybridLegacyProposalType(proposalType)) {
    return "hybrid";
  }

  if (isOffchainLegacyProposalType(proposalType)) {
    return "offchain";
  }

  return "onchain";
}

export function inferSourceFromLegacyProposalType(
  proposalType: LegacyProposalType
): ProposalSource {
  if (proposalType === "SNAPSHOT") {
    return "snapshot";
  }

  return "unknown";
}

export function fromLegacyProposalType(
  proposalType: LegacyProposalType,
  overrides: Partial<Pick<ProposalKind, "mode" | "source">> = {}
): ProposalKind {
  const votingKind = inferVotingKindFromLegacyProposalType(proposalType);
  const scope =
    votingKind === "snapshot"
      ? "offchain"
      : inferScopeFromLegacyProposalType(proposalType);
  const source =
    overrides.source ?? inferSourceFromLegacyProposalType(proposalType);

  if (votingKind !== "optimistic") {
    return {
      votingKind,
      scope,
      source,
    };
  }

  return {
    votingKind,
    scope,
    source,
    mode:
      overrides.mode ??
      (isTieredLegacyProposalType(proposalType) ? "tiered" : "basic"),
  };
}

export function resolveLinkedOffchainProposalKind(
  kind: ProposalKind
): ProposalKind {
  if (kind.scope !== "offchain") {
    return kind;
  }

  if (kind.votingKind === "standard" || kind.votingKind === "approval") {
    return {
      ...kind,
      scope: "hybrid",
    };
  }

  if (kind.votingKind === "optimistic" && kind.mode === "tiered") {
    return {
      ...kind,
      scope: "hybrid",
    };
  }

  return kind;
}

export function toLegacyProposalType(kind: ProposalKind): LegacyProposalType {
  if (kind.votingKind === "snapshot") {
    return "SNAPSHOT";
  }

  if (kind.votingKind === "standard") {
    if (kind.scope === "hybrid") return "HYBRID_STANDARD";
    if (kind.scope === "offchain") return "OFFCHAIN_STANDARD";
    return "STANDARD";
  }

  if (kind.votingKind === "approval") {
    if (kind.scope === "hybrid") return "HYBRID_APPROVAL";
    if (kind.scope === "offchain") return "OFFCHAIN_APPROVAL";
    return "APPROVAL";
  }

  if (kind.scope === "hybrid") {
    return kind.mode === "tiered"
      ? "HYBRID_OPTIMISTIC_TIERED"
      : "HYBRID_OPTIMISTIC";
  }

  if (kind.scope === "offchain") {
    return kind.mode === "tiered"
      ? "OFFCHAIN_OPTIMISTIC_TIERED"
      : "OFFCHAIN_OPTIMISTIC";
  }

  return "OPTIMISTIC";
}
