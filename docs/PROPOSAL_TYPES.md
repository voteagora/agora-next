# Proposal Types Documentation

> **Last Updated:** 2025-12-03

This document describes the different proposal types in the Agora governance system, including their status derivation logic, metrics calculations, and key input/output values.

---

## Table of Contents

1. [Proposal Type Taxonomy](#proposal-type-taxonomy)
2. [Status Derivation](#status-derivation)
3. [Metrics Calculations](#metrics-calculations)
4. [Type Definitions](#type-definitions)

---

## Proposal Type Taxonomy

```typescript
type ProposalType =
  | "STANDARD" // Simple for/against/abstain (onchain)
  | "APPROVAL" // Multi-choice approval voting (onchain)
  | "OPTIMISTIC" // Pass unless vetoed (onchain)
  | "SNAPSHOT" // Snapshot voting
  | "OFFCHAIN_STANDARD" // EAS-based standard
  | "OFFCHAIN_APPROVAL" // EAS-based approval
  | "OFFCHAIN_OPTIMISTIC" // EAS-based optimistic
  | "OFFCHAIN_OPTIMISTIC_TIERED" // EAS-based tiered optimistic
  | "HYBRID_STANDARD" // Onchain + offchain combined
  | "HYBRID_APPROVAL" // Onchain + offchain approval
  | "HYBRID_OPTIMISTIC" // Onchain + offchain optimistic
  | "HYBRID_OPTIMISTIC_TIERED"; // Onchain + offchain tiered
```

### Classification by Voting Mechanism

| Base Class | Onchain    | Offchain                                        | Hybrid                                      |
| ---------- | ---------- | ----------------------------------------------- | ------------------------------------------- |
| STANDARD   | STANDARD   | OFFCHAIN_STANDARD                               | HYBRID_STANDARD                             |
| APPROVAL   | APPROVAL   | OFFCHAIN_APPROVAL                               | HYBRID_APPROVAL                             |
| OPTIMISTIC | OPTIMISTIC | OFFCHAIN_OPTIMISTIC, OFFCHAIN_OPTIMISTIC_TIERED | HYBRID_OPTIMISTIC, HYBRID_OPTIMISTIC_TIERED |
| SNAPSHOT   | -          | SNAPSHOT                                        | -                                           |

### Voter Groups

For **hybrid** and **offchain** proposals, votes come from multiple voter groups:

| Group     | Description                  | Eligible Voters Constant |
| --------- | ---------------------------- | ------------------------ |
| DELEGATES | Token House (onchain voters) | 30% of votable supply    |
| APP       | Citizen House - Apps         | 100                      |
| USER      | Citizen House - Users        | 1000                     |
| CHAIN     | Citizen House - Chains       | 15                       |

### Vote Weights (Hybrid Proposals)

```typescript
const HYBRID_VOTE_WEIGHTS = {
  delegates: 0.5, // 50%
  apps: 1 / 6, // ~16.67%
  users: 1 / 6, // ~16.67%
  chains: 1 / 6, // ~16.67%
};
```

---

## Status Derivation

Proposal status is derived from multiple sources including lifecycle events, block/timestamp data, and vote tallies.

### Status Enum

```typescript
type ProposalStatus =
  | "PENDING" // Voting hasn't started
  | "ACTIVE" // Voting in progress
  | "CANCELLED" // Proposal was cancelled
  | "SUCCEEDED" // Proposal passed
  | "DEFEATED" // Proposal failed
  | "QUEUED" // Awaiting execution
  | "EXECUTED" // Successfully executed
  | "PASSED" // Passed but expired (no onchain actions)
  | "FAILED" // Generic failure
  | "CLOSED"; // Snapshot closed
```

### Status Derivation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATUS DERIVATION ORDER                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. SNAPSHOT → Use snapshot's own status field                  │
│     └── Returns: "PENDING" | "ACTIVE" | "CLOSED"                │
│                                                                  │
│  2. Terminal States (check first):                              │
│     ├── cancelled_block/cancelled_attestation_hash → CANCELLED  │
│     ├── executed_block → EXECUTED                               │
│     └── queued_block:                                           │
│         ├── >10 days old + no calldata → PASSED                 │
│         └── else → QUEUED                                       │
│                                                                  │
│  3. Active States (based on timing):                            │
│     ├── before start_block/start_timestamp → PENDING            │
│     └── before end_block/end_timestamp → ACTIVE                 │
│                                                                  │
│  4. Vote-Based Status (after voting ends):                      │
│     └── Calculated per proposal type (see below)                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Status by Proposal Type

#### STANDARD / OFFCHAIN_STANDARD

```typescript
// Inputs
const forVotes: bigint;
const againstVotes: bigint;
const abstainVotes: bigint;
const quorum: bigint;
const approvalThreshold: bigint; // basis points (5100 = 51%)

// Quorum calculation varies by tenant:
// - UNISWAP: forVotes only
// - SCROLL: forVotes + againstVotes + abstainVotes
// - OPTIMISM (calculationOptions=1): forVotes only
// - DEFAULT: forVotes + abstainVotes

const thresholdVotes = forVotes + againstVotes;
const voteThresholdPercent =
  thresholdVotes > 0 ? (forVotes / thresholdVotes) * 100 : 0;

// Status determination
if (
  quorumVotes < quorum ||
  forVotes < againstVotes ||
  voteThresholdPercent < approvalThreshold
) {
  return "DEFEATED";
}
if (forVotes > againstVotes) {
  return "SUCCEEDED";
}
return "FAILED";
```

#### HYBRID_STANDARD

Uses `calculateHybridStandardTallies()`:

```typescript
// Inputs
interface HybridStandardInputs {
  proposalResults: {
    DELEGATES?: { for: bigint; against: bigint; abstain: bigint };
    APP: { for: bigint; against: bigint; abstain: bigint };
    USER: { for: bigint; against: bigint; abstain: bigint };
    CHAIN: { for: bigint; against: bigint; abstain: bigint };
  };
  quorum: number;
  approvalThreshold: number;
  calculationOptions?: 0 | 1; // 0 = for+abstain, 1 = for only
}

// Calculation
const QUORUM_THRESHOLD = 0.3; // 30%

// Per-group tally calculation
const calculateTally = (category, eligibleCount) => ({
  forVotes: Number(category.for),
  againstVotes: Number(category.against),
  abstainVotes: Number(category.abstain),
  quorumVotes: calculationOptions === 1 ? forVotes : forVotes + abstainVotes,
  quorum: quorumVotes / eligibleCount,
  approval: forVotes / (forVotes + againstVotes),
  passingQuorum: quorum >= QUORUM_THRESHOLD,
  passingApproval: approval >= approvalThreshold,
});

// Final weighted calculation
const finalQuorum = Σ(tally.quorum * weight[i]);
const finalApproval = Σ(tally.approval * weight[i]);

// Outputs
interface HybridStandardOutputs {
  quorumMet: boolean; // finalQuorumMet && finalApprovalMet
  finalQuorum: number; // weighted quorum percentage
  finalApproval: number; // weighted approval percentage
  finalQuorumMet: boolean; // finalQuorum >= 0.30
  finalApprovalMet: boolean; // finalApproval >= approvalThreshold
}

// Status
return outputs.quorumMet ? "SUCCEEDED" : "DEFEATED";
```

#### APPROVAL

```typescript
// Inputs
interface ApprovalInputs {
  for: bigint;
  abstain: bigint;
  against: bigint;
  options: Array<{ option: string; votes: bigint }>;
  criteria: "THRESHOLD" | "TOP_CHOICES";
  criteriaValue: bigint;
  quorum: bigint;
}

// Calculation
const proposalQuorumVotes = forVotes + abstainVotes;

if (quorum && proposalQuorumVotes < quorum) {
  return "DEFEATED";
}

if (criteria === "THRESHOLD") {
  // At least one option must exceed threshold
  for (const option of options) {
    if (option.votes > criteriaValue) {
      return "SUCCEEDED";
    }
  }
  return "DEFEATED";
} else {
  // TOP_CHOICES: auto-succeeds if quorum met
  return "SUCCEEDED";
}
```

#### HYBRID_APPROVAL

Uses `calculateHybridApprovalProposalMetrics()`:

```typescript
// Inputs
interface HybridApprovalInputs {
  proposalResults: {
    DELEGATES?: Record<string, bigint>; // optionName → votes
    APP: Record<string, bigint>;
    USER: Record<string, bigint>;
    CHAIN: Record<string, bigint>;
    for: bigint;
    against: bigint;
    criteria: "THRESHOLD" | "TOP_CHOICES";
    criteriaValue: bigint;
    totals: { vote_counts: { APP: number; USER: number; CHAIN: number } };
  };
  proposalData: {
    options: Array<{ description: string; budgetTokensSpent: bigint }>;
    proposalSettings: {
      budgetToken: string;
      budgetAmount: bigint;
      criteriaValue: bigint;
    };
  };
  quorum: number;
  createdTime: Date;
}

// Calculation
const QUORUM_THRESHOLD = 0.3 * 100; // 30%

// Weighted participation percentage per option
const calculateWeightedPercentage = (optionName) => {
  let weighted = 0;
  weighted += (delegatesVotes / eligibleDelegates) * 0.5 * 100;
  weighted += (appsVotes / 100) * (1 / 6) * 100;
  weighted += (usersVotes / 1000) * (1 / 6) * 100;
  weighted += (chainsVotes / 15) * (1 / 6) * 100;
  return weighted;
};

// Unique participation percentage
const totalWeightedParticipation = calculateUniqueParticipation();

// Outputs
interface HybridApprovalOutputs {
  totalWeightedParticipation: number; // overall participation %
  quorumMet: boolean; // participation >= 30%
  thresholdMet: boolean; // at least one option meets threshold
  optionResults: Array<{
    optionName: string;
    weightedPercentage: number;
    meetsThreshold: boolean;
    rawVotes: bigint;
  }>;
  optionsWithApproval: Array<{
    option: string;
    optionBudget: bigint;
    passesModuleCriteria: boolean;
    isApproved: boolean; // passes criteria AND within budget
    weightedPercentage: number;
  }>;
  remainingBudget: bigint;
}

// Status
if (!quorumMet) return "DEFEATED";
if (criteria === "THRESHOLD") {
  return thresholdMet ? "SUCCEEDED" : "DEFEATED";
}
return "SUCCEEDED";
```

#### OPTIMISTIC

```typescript
// Inputs
interface OptimisticInputs {
  for: bigint;
  against: bigint;
  abstain: bigint;
  votableSupply: bigint;
}

// Calculation: passes unless >50% of votable supply vetoes
if (against > votableSupply / 2n) {
  return "DEFEATED";
}
return "SUCCEEDED";
```

#### HYBRID_OPTIMISTIC_TIERED / OFFCHAIN_OPTIMISTIC_TIERED

Uses `calculateHybridOptimisticProposalMetrics()`:

```typescript
// Inputs
interface OptimisticTieredInputs {
  proposalResults: {
    DELEGATES?: { against: bigint };
    APP: { against: bigint };
    USER: { against: bigint };
    CHAIN: { against: bigint };
  };
  proposalData: {
    tiers?: number[]; // [twoGroupThreshold, threeGroupThreshold, fourGroupThreshold]
  };
  quorum: number;
}

// Default tiers (basis points converted to %)
const HYBRID_TIERS = [55, 45, 35]; // HYBRID_OPTIMISTIC_TIERED
const OFFCHAIN_TIERS = [65, 65, 65]; // OFFCHAIN_OPTIMISTIC_TIERED
const OFFCHAIN_SIMPLE = [20, 20, 20]; // OFFCHAIN_OPTIMISTIC

// Calculation
const calculateVetoTally = (category, eligibleCount) => ({
  againstVotes: Number(category.against),
  vetoPercentage: (againstVotes / eligibleCount) * 100,
});

// Tiered veto logic
const thresholds = {
  twoGroups: tiers[0],
  threeGroups: tiers[1],
  fourGroups: tiers[2],
};

// OFFCHAIN_OPTIMISTIC_TIERED: average veto across 3 groups
if (type === "OFFCHAIN_OPTIMISTIC_TIERED") {
  const avgVeto = (app + user + chain) / 3;
  vetoTriggered = avgVeto >= tiers[0];
} else {
  // HYBRID: progressive tier check
  vetoTriggered =
    groupsExceeding(fourThreshold) >= 4 ||
    groupsExceeding(threeThreshold) >= 3 ||
    groupsExceeding(twoThreshold) >= 2;
}

// Outputs
interface OptimisticTieredOutputs {
  vetoThresholdMet: boolean;
  totalAgainstVotes: number; // weighted percentage
  groupTallies: Array<{
    name: string;
    againstVotes: number;
    vetoPercentage: number;
    exceedsThreshold: boolean;
  }>;
  thresholds: { twoGroups; threeGroups; fourGroups };
}

// Status
return vetoThresholdMet ? "DEFEATED" : "SUCCEEDED";
```

---

## Metrics Calculations

### Key Metrics Functions

| Function                                     | Proposal Types                                       | Purpose                              |
| -------------------------------------------- | ---------------------------------------------------- | ------------------------------------ |
| `calculateHybridStandardTallies()`           | HYBRID_STANDARD                                      | Weighted quorum/approval             |
| `calculateHybridStandardProposalMetrics()`   | HYBRID_STANDARD                                      | Full metrics with vote percentages   |
| `calculateHybridApprovalProposalMetrics()`   | HYBRID_APPROVAL, OFFCHAIN_APPROVAL                   | Option approval with budget tracking |
| `calculateHybridOptimisticProposalMetrics()` | HYBRID_OPTIMISTIC_TIERED, OFFCHAIN_OPTIMISTIC_TIERED | Tiered veto calculation              |
| `calculateOptimisticProposalMetrics()`       | OPTIMISTIC                                           | Simple veto percentage               |
| `getProposalCurrentQuorum()`                 | STANDARD, APPROVAL, OPTIMISTIC                       | Tenant-specific quorum               |

### Metrics Output Shapes

#### calculateHybridStandardProposalMetrics

```typescript
interface HybridStandardMetrics {
  quorumPercentage: number; // 0-100
  finalQuorumMet: boolean;
  quorumMet: boolean; // includes approval check
  finalApproval: number; // 0-1
  totalForVotesPercentage: number;
  totalAgainstVotesPercentage: number;
  totalAbstainVotesPercentage: number;
}
```

#### calculateHybridApprovalProposalMetrics

```typescript
interface HybridApprovalMetrics {
  totalWeightedParticipation: number;
  thresholdMet: boolean;
  quorumMet: boolean;
  proposalForVotes: bigint;
  proposalAgainstVotes: bigint;
  proposalTotalVotes: bigint;
  optionResults: Array<{
    optionName: string;
    weightedPercentage: number;
    meetsThreshold: boolean;
    rawVotes: bigint;
  }>;
  optionsWithApproval: Array<{
    option: string;
    optionBudget: bigint;
    passesModuleCriteria: boolean;
    isApproved: boolean;
    weightedPercentage: number;
    rawVotes: bigint;
  }> | null;
  remainingBudget: bigint | null;
}
```

#### calculateHybridOptimisticProposalMetrics

```typescript
interface HybridOptimisticMetrics {
  vetoThresholdMet: boolean;
  totalAgainstVotes: number;
  groupTallies: Array<{
    name: "delegates" | "apps" | "users" | "chains";
    againstVotes: number;
    vetoPercentage: number;
    exceedsThreshold: boolean;
  }>;
  thresholds: {
    twoGroups: number;
    threeGroups: number;
    fourGroups: number;
  };
}
```

#### calculateOptimisticProposalMetrics

```typescript
interface OptimisticMetrics {
  againstRelativeAmount: number; // % of votable supply
  againstLength: number; // formatted token amount
  formattedVotableSupply: number;
  status: "approved" | "defeated";
}
```

---

## Type Definitions

### ParsedProposalData

Input data structure parsed from proposal_data field:

```typescript
type ParsedProposalData = {
  SNAPSHOT: {
    key: "SNAPSHOT";
    kind: {
      title: string;
      start_ts: number;
      end_ts: number;
      created_ts: number;
      link: string;
      scores: string[];
      type: string;
      votes: string;
      state: "pending" | "active" | "closed";
      body: string;
      choices: string[];
    };
  };

  STANDARD: {
    key: "STANDARD";
    kind: {
      options: Array<{
        targets: string[];
        values: string[];
        signatures: string[];
        calldatas: string[];
        functionArgsName: Array<{
          functionName: string;
          functionArgs: string[];
        }>;
      }>;
      calculationOptions?: 0 | 1;
    };
  };

  APPROVAL: {
    key: "APPROVAL";
    kind: {
      options: Array<{
        targets: string[];
        values: string[];
        calldatas: string[];
        description: string;
        functionArgsName: Array<{
          functionName: string;
          functionArgs: string[];
        }>;
        budgetTokensSpent: bigint | null;
      }>;
      proposalSettings: {
        maxApprovals: number;
        criteria: "THRESHOLD" | "TOP_CHOICES";
        budgetToken: string;
        criteriaValue: bigint;
        budgetAmount: bigint;
      };
    };
  };

  OPTIMISTIC: {
    key: "OPTIMISTIC";
    kind: {
      options: [];
      disapprovalThreshold: number; // percentage (e.g., 20 = 20%)
    };
  };

  HYBRID_OPTIMISTIC_TIERED: {
    key: "HYBRID_OPTIMISTIC_TIERED";
    kind: {
      options: [];
      tiers: number[]; // [55, 45, 35] for 2/3/4 group thresholds
      onchainProposalId?: string;
      created_attestation_hash?: string;
      cancelled_attestation_hash?: string;
    };
  };

  // Similar structures for other HYBRID_* and OFFCHAIN_* types
};
```

### ParsedProposalResults

Output data structure containing vote tallies:

```typescript
type ParsedProposalResults = {
  STANDARD: {
    key: "STANDARD";
    kind: {
      for: bigint;
      against: bigint;
      abstain: bigint;
    };
  };

  APPROVAL: {
    key: "APPROVAL";
    kind: {
      for: bigint;
      abstain: bigint;
      against: bigint;
      options: Array<{ option: string; votes: bigint }>;
      criteria: "THRESHOLD" | "TOP_CHOICES";
      criteriaValue: bigint;
    };
  };

  HYBRID_STANDARD: {
    key: "HYBRID_STANDARD";
    kind: {
      DELEGATES?: { for: bigint; abstain: bigint; against: bigint };
      APP: { for: bigint; abstain: bigint; against: bigint };
      USER: { for: bigint; abstain: bigint; against: bigint };
      CHAIN: { for: bigint; abstain: bigint; against: bigint };
      for: bigint; // aggregated
      against: bigint;
      abstain: bigint;
    };
  };

  HYBRID_APPROVAL: {
    key: "HYBRID_APPROVAL";
    kind: {
      options: Array<{
        option: string;
        weightedPercentage: number;
        isApproved?: boolean;
      }>;
      APP: Record<string, bigint>; // optionName → votes
      USER: Record<string, bigint>;
      CHAIN: Record<string, bigint>;
      DELEGATES?: Record<string, bigint>;
      criteria: "THRESHOLD" | "TOP_CHOICES";
      criteriaValue: bigint;
      for: bigint;
      against: bigint;
      abstain: bigint;
    };
  };

  HYBRID_OPTIMISTIC_TIERED: {
    key: "HYBRID_OPTIMISTIC_TIERED";
    kind: {
      DELEGATES?: { for: bigint; against: bigint };
      APP: { for: bigint; against: bigint };
      USER: { for: bigint; against: bigint };
      CHAIN: { for: bigint; against: bigint };
      for: bigint;
      against: bigint;
    };
  };

  SNAPSHOT: {
    key: "SNAPSHOT";
    kind: {
      scores: string[];
      status: "pending" | "active" | "closed";
    };
  };
};
```

---

## Constants Reference

```typescript
// Eligible voter counts for offchain groups
const OFFCHAIN_THRESHOLDS = {
  APP: 100,
  USER: 1000,
  CHAIN: 15,
};

// Voting weights for hybrid proposals
const HYBRID_VOTE_WEIGHTS = {
  delegates: 0.5,
  apps: 1 / 6,
  users: 1 / 6,
  chains: 1 / 6,
};

// Quorum threshold for hybrid proposals
const HYBRID_PROPOSAL_QUORUM = 0.3; // 30%

// Veto thresholds for tiered optimistic proposals
const HYBRID_OPTIMISTIC_TIERED_THRESHOLD = [55, 45, 35];
const OFFCHAIN_OPTIMISTIC_TIERED_THRESHOLD = [65, 65, 65];
const OFFCHAIN_OPTIMISTIC_THRESHOLD = [20, 20, 20];
```

---

## Key Files

| File                                            | Purpose                   |
| ----------------------------------------------- | ------------------------- |
| `src/lib/proposalUtils.ts`                      | Core metrics calculations |
| `src/lib/proposalUtils/proposalStatus.ts`       | Status derivation logic   |
| `src/lib/proposalUtils/parseProposalResults.ts` | Result parsing            |
| `src/lib/types/archiveProposal.ts`              | Archive data types        |
| `src/lib/types.d.ts`                            | ProposalType definition   |
| `src/lib/constants.ts`                          | Thresholds and weights    |
