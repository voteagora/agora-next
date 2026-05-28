---
name: proposal-types
description: >-
  Deep reference for Agora governance proposal types: vote data structures,
  status calculation logic, type detection, and hybrid/offchain variants.
  Use when working on proposal status, vote tallies, vote summaries, proposal
  components, or when the user mentions STANDARD, APPROVAL, OPTIMISTIC,
  HYBRID, OFFCHAIN proposal types or calcWeightedPercentage, deriveStandardStatus,
  calculateTieredVeto, resolveArchiveThresholds, or govless_proposal.
---

# Proposal Types Reference

Full index and individual docs live in [`docs/PROPOSAL_TYPES.md`](../../../docs/PROPOSAL_TYPES.md) and [`docs/proposal-types/`](../../../docs/proposal-types/).

---

## Type Detection Cheatsheet

```typescript
// STANDARD
source === "dao_node" && voting_module_name === "standard" && hybrid === false

// HYBRID_STANDARD
source === "dao_node" && voting_module_name === "standard" && hybrid === true && govless_proposal !== undefined

// APPROVAL
source === "dao_node" && voting_module_name === "approval" && hybrid === false

// HYBRID_APPROVAL
source === "dao_node" && voting_module_name === "approval" && hybrid === true

// OPTIMISTIC (onchain)
source === "dao_node" && voting_module_name === "optimistic"

// HYBRID_OPTIMISTIC_TIERED
source === "dao_node" && hybrid === true && govless_proposal?.tiers?.length > 0

// OFFCHAIN_OPTIMISTIC (pure citizen, no tiers)
source === "eas-atlas" && proposal_type === "OPTIMISTIC" && tiers.length === 0 && onchain_proposalid === 0

// OFFCHAIN_OPTIMISTIC_TIERED
source === "eas-atlas" && proposal_type === "OPTIMISTIC_TIERED"

// OFFCHAIN_STANDARD
source === "eas-oodao"
```

---

## Shared Constants

```typescript
const HYBRID_VOTE_WEIGHTS = {
  delegates: 0.5,   // 50%
  apps: 1 / 6,      // ~16.67%
  users: 1 / 6,     // ~16.67%
  chains: 1 / 6,    // ~16.67%
};

const OFFCHAIN_THRESHOLDS = { USER: 1000, APP: 100, CHAIN: 15 };

const OFFCHAIN_OPTIMISTIC_THRESHOLD = [20, 20, 20]; // flat 20% per tier
```

---

## Status Derivation Order (all types)

1. `cancel_event` → `CANCELLED`
2. `execute_event` → `EXECUTED`
3. `queue_event` + >10 days → `PASSED`; + has actions → `QUEUED`
4. `currentBlock < start_block` → `PENDING`
5. `currentBlock < end_block` → `ACTIVE`
6. After voting ends → vote-based calculation (type-specific, see below)

---

## Vote-Based Status by Type

### STANDARD (dao_node)
- Quorum check: `calculateQuorumBigInt(for, against, abstain) >= thresholds.quorum`
- Approval check: `for / (for + against) >= approvalThreshold / 100`
- Pass condition: quorum AND approval both met
- Optimism edge: if `quorum === 0n` and `forVotes < againstVotes` → `DEFEATED`

### HYBRID_STANDARD (dao_node + eas-atlas)
- Computes weighted % for each vote type: `delegatePct*0.5 + userPct/6 + appPct/6 + chainPct/6`
- `eligibleDelegates` = `total_voting_power_at_start` (full supply, not quorum-derived)
- Pass condition: threshold OR quorum met (**OR, not AND**)
- See [`HYBRID_STANDARD.md`](../../../docs/proposal-types/HYBRID_STANDARD.md)

### APPROVAL / HYBRID_APPROVAL
- Voters pick N options from a set of choices
- Approved options = those meeting `approval_threshold` and `max_approvals` cap
- See [`APPROVAL.md`](../../../docs/proposal-types/APPROVAL.md) / [`HYBRID_APPROVAL.md`](../../../docs/proposal-types/HYBRID_APPROVAL.md)

### OPTIMISTIC (onchain) / OFFCHAIN_OPTIMISTIC / OFFCHAIN_OPTIMISTIC_TIERED / HYBRID_OPTIMISTIC_TIERED
- Default: `SUCCEEDED` — veto must be triggered to `DEFEATED`
- Veto via `calculateTieredVeto`: checks how many groups exceed each tier threshold
- OFFCHAIN_OPTIMISTIC: flat `[20, 20, 20]` thresholds, 2+ groups must each hit threshold
- TIERED: tier values from `tiers` field on govless_proposal
- See individual docs for exact thresholds and coalition logic

### OFFCHAIN_STANDARD (eas-oodao)
- Uses `outcome["token-holders"]` vote totals
- Same approval + quorum logic as dao_node STANDARD
- See [`OFFCHAIN_STANDARD.md`](../../../docs/proposal-types/OFFCHAIN_STANDARD.md)

---

## Vote Data Shapes

### Onchain (dao_node) — totals
```typescript
totals["no-param"] = { "0": string, "1": string, "2": string } // against, for, abstain (wei)
```

### Offchain citizen (eas-atlas) — outcome
```typescript
outcome = {
  USER:  { "0": number, "1": number, "2": number }, // against, for, abstain
  APP?:  { "0"?: number, "1"?: number, "2"?: number },
  CHAIN?: { "0"?: number, "1"?: number, "2"?: number }
}
```

### Approval choices — totals
```typescript
totals[optionKey] = { "1": string } // for votes per option (wei)
```

---

## Key Source Files

| File | Purpose |
|---|---|
| `src/lib/proposals/normalizeArchive.ts` | Type detection + normalization |
| `src/lib/proposals/thresholds.ts` | `resolveArchiveThresholds` |
| `src/lib/types/archiveProposal.ts` | Archive data types |
| `src/lib/types.d.ts` | `ProposalType` enum |

---

## Individual Type Docs

- [`STANDARD.md`](../../../docs/proposal-types/STANDARD.md)
- [`HYBRID_STANDARD.md`](../../../docs/proposal-types/HYBRID_STANDARD.md)
- [`APPROVAL.md`](../../../docs/proposal-types/APPROVAL.md)
- [`HYBRID_APPROVAL.md`](../../../docs/proposal-types/HYBRID_APPROVAL.md)
- [`OPTIMISTIC.md`](../../../docs/proposal-types/OPTIMISTIC.md)
- [`HYBRID_OPTIMISTIC_TIERED.md`](../../../docs/proposal-types/HYBRID_OPTIMISTIC_TIERED.md)
- [`OFFCHAIN_OPTIMISTIC.md`](../../../docs/proposal-types/OFFCHAIN_OPTIMISTIC.md)
- [`OFFCHAIN_OPTIMISTIC_TIERED.md`](../../../docs/proposal-types/OFFCHAIN_OPTIMISTIC_TIERED.md)
- [`OFFCHAIN_STANDARD.md`](../../../docs/proposal-types/OFFCHAIN_STANDARD.md)
