# Proposal Types Documentation

> **Last Updated:** 2025-12-04

Index of proposal types in the Agora governance system. Each type has detailed documentation with examples and status logic.

---

## Proposal Type Index

| Type                       | Source                   | Doc                                                                             |
| -------------------------- | ------------------------ | ------------------------------------------------------------------------------- |
| STANDARD                   | `dao_node`               | [STANDARD.md](./proposal-types/STANDARD.md)                                     |
| HYBRID_STANDARD            | `dao_node` + `eas-atlas` | [HYBRID_STANDARD.md](./proposal-types/HYBRID_STANDARD.md)                       |
| APPROVAL                   | `dao_node`               | [APPROVAL.md](./proposal-types/APPROVAL.md)                                     |
| HYBRID_APPROVAL            | `dao_node` + `eas-atlas` | [HYBRID_APPROVAL.md](./proposal-types/HYBRID_APPROVAL.md)                       |
| OPTIMISTIC                 | `dao_node`               | [OPTIMISTIC.md](./proposal-types/OPTIMISTIC.md)                                 |
| HYBRID_OPTIMISTIC          | `dao_node` + `eas-atlas` | ⚠️ _Needs example_                                                              |
| HYBRID_OPTIMISTIC_TIERED   | `dao_node` + `eas-atlas` | [HYBRID_OPTIMISTIC_TIERED.md](./proposal-types/HYBRID_OPTIMISTIC_TIERED.md)     |
| OFFCHAIN_OPTIMISTIC        | `eas-atlas`              | [OFFCHAIN_OPTIMISTIC.md](./proposal-types/OFFCHAIN_OPTIMISTIC.md)               |
| OFFCHAIN_OPTIMISTIC_TIERED | `eas-atlas`              | [OFFCHAIN_OPTIMISTIC_TIERED.md](./proposal-types/OFFCHAIN_OPTIMISTIC_TIERED.md) |
| OFFCHAIN_STANDARD          | `eas-oodao`              | [OFFCHAIN_STANDARD.md](./proposal-types/OFFCHAIN_STANDARD.md)                   |
| OFFCHAIN_APPROVAL          | `eas-atlas`              | ⚠️ _Needs example_                                                              |
| SNAPSHOT                   | `snapshot`               | ⚠️ _Needs example_                                                              |

---

## Data Sources

| Source      | Description                                      |
| ----------- | ------------------------------------------------ |
| `dao_node`  | Onchain proposals from DAO governor contract     |
| `eas-atlas` | EAS-based proposals for OP citizen voting        |
| `eas-oodao` | EAS-based generic DAO proposals (e.g. Syndicate) |

---

## Voter Groups

| Group     | Description            | Eligible Count        |
| --------- | ---------------------- | --------------------- |
| DELEGATES | Token House (onchain)  | 30% of votable supply |
| USER      | Citizen House - Users  | 1000                  |
| APP       | Citizen House - Apps   | 100                   |
| CHAIN     | Citizen House - Chains | 15                    |

---

## Hybrid Vote Weights

```typescript
const HYBRID_VOTE_WEIGHTS = {
  delegates: 0.5, // 50%
  apps: 1 / 6, // ~16.67%
  users: 1 / 6, // ~16.67%
  chains: 1 / 6, // ~16.67%
};
```

---

## Status Derivation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATUS DERIVATION ORDER                       │
├─────────────────────────────────────────────────────────────────┤
│  1. Terminal States (check first):                              │
│     ├── cancel_event/delete_event → CANCELLED                   │
│     ├── execute_event → EXECUTED                                │
│     └── queue_event → QUEUED (or PASSED if expired)             │
│                                                                  │
│  2. Timing States:                                              │
│     ├── before start_block → PENDING                            │
│     └── before end_block → ACTIVE                               │
│                                                                  │
│  3. Vote-Based Status (after voting ends):                      │
│     └── Calculated per proposal type (see individual docs)      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Status Enum

```typescript
type ProposalStatus =
  | "PENDING" // Voting hasn't started
  | "ACTIVE" // Voting in progress
  | "CANCELLED" // Proposal was cancelled
  | "SUCCEEDED" // Proposal passed
  | "DEFEATED" // Proposal failed
  | "QUEUED" // Awaiting execution
  | "EXECUTED" // Successfully executed
  | "PASSED" // Passed but expired
  | "FAILED"; // Generic failure
```

---

## Key Files

| File                                    | Purpose                 |
| --------------------------------------- | ----------------------- |
| `src/lib/types/archiveProposal.ts`      | Archive data types      |
| `src/lib/proposals/normalizeArchive.ts` | Normalization logic     |
| `src/lib/proposals/thresholds.ts`       | Threshold calculations  |
| `src/lib/types.d.ts`                    | ProposalType definition |
