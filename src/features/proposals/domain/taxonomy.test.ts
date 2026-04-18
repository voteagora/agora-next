import { describe, expect, test } from "vitest";
import {
  fromLegacyProposalType,
  normalizeProposalSource,
  resolveLinkedOffchainProposalKind,
  toLegacyProposalType,
  type LegacyProposalType,
  type ProposalKind,
} from "./taxonomy";

const LEGACY_PROPOSAL_TYPES: LegacyProposalType[] = [
  "STANDARD",
  "APPROVAL",
  "OPTIMISTIC",
  "SNAPSHOT",
  "OFFCHAIN_OPTIMISTIC_TIERED",
  "OFFCHAIN_OPTIMISTIC",
  "OFFCHAIN_STANDARD",
  "OFFCHAIN_APPROVAL",
  "HYBRID_STANDARD",
  "HYBRID_APPROVAL",
  "HYBRID_OPTIMISTIC",
  "HYBRID_OPTIMISTIC_TIERED",
];

describe("proposal taxonomy", () => {
  test("round-trips all legacy proposal types through the canonical kind", () => {
    for (const proposalType of LEGACY_PROPOSAL_TYPES) {
      expect(toLegacyProposalType(fromLegacyProposalType(proposalType))).toBe(
        proposalType
      );
    }
  });

  test("supports explicit source and mode overrides when deriving a kind", () => {
    expect(
      fromLegacyProposalType("STANDARD", {
        source: "dao_node",
      })
    ).toEqual({
      votingKind: "standard",
      scope: "onchain",
      source: "dao_node",
    });

    expect(
      fromLegacyProposalType("OFFCHAIN_OPTIMISTIC", {
        mode: "tiered",
        source: "eas-atlas",
      })
    ).toEqual({
      votingKind: "optimistic",
      scope: "offchain",
      source: "eas-atlas",
      mode: "tiered",
    });
  });

  test("normalizes linked offchain kinds into their hybrid display variants only where needed", () => {
    const standardKind = fromLegacyProposalType("OFFCHAIN_STANDARD");
    const approvalKind = fromLegacyProposalType("OFFCHAIN_APPROVAL");
    const optimisticKind = fromLegacyProposalType("OFFCHAIN_OPTIMISTIC");
    const tieredOptimisticKind = fromLegacyProposalType(
      "OFFCHAIN_OPTIMISTIC_TIERED"
    );

    expect(
      toLegacyProposalType(resolveLinkedOffchainProposalKind(standardKind))
    ).toBe("HYBRID_STANDARD");
    expect(
      toLegacyProposalType(resolveLinkedOffchainProposalKind(approvalKind))
    ).toBe("HYBRID_APPROVAL");
    expect(
      toLegacyProposalType(resolveLinkedOffchainProposalKind(optimisticKind))
    ).toBe("OFFCHAIN_OPTIMISTIC");
    expect(
      toLegacyProposalType(
        resolveLinkedOffchainProposalKind(tieredOptimisticKind)
      )
    ).toBe("HYBRID_OPTIMISTIC_TIERED");
  });

  test("normalizes proposal sources defensively", () => {
    expect(normalizeProposalSource("snapshot")).toBe("snapshot");
    expect(normalizeProposalSource("eas-atlas")).toBe("eas-atlas");
    expect(normalizeProposalSource("unexpected-source")).toBe("unknown");
    expect(normalizeProposalSource(null)).toBe("unknown");
  });

  test("keeps already-onchain and already-hybrid kinds unchanged when resolving linked offchain kinds", () => {
    const onchainKind: ProposalKind = {
      votingKind: "standard",
      scope: "onchain",
      source: "unknown",
    };
    const hybridKind: ProposalKind = {
      votingKind: "approval",
      scope: "hybrid",
      source: "unknown",
    };

    expect(resolveLinkedOffchainProposalKind(onchainKind)).toEqual(onchainKind);
    expect(resolveLinkedOffchainProposalKind(hybridKind)).toEqual(hybridKind);
  });
});
