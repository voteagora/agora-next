# Proposals Specification

## Overview

This document outlines the comprehensive proposal system implemented in Agora Next, covering all proposal types, lifecycle stages, and tenant-specific configurations.

## Proposal Types

### 1. Core Proposal Types

The system supports the following proposal types defined in `/src/lib/types.d.ts`:

```typescript
export type ProposalType =
  | "STANDARD"                    // Standard on-chain governor proposal
  | "APPROVAL"                    // Multi-choice approval voting
  | "OPTIMISTIC"                  // Optimistic (veto-based) governance
  | "SNAPSHOT"                    // Off-chain Snapshot voting
  | "OFFCHAIN_OPTIMISTIC_TIERED"  // Off-chain optimistic with tiered thresholds
  | "OFFCHAIN_OPTIMISTIC"         // Off-chain optimistic voting
  | "OFFCHAIN_STANDARD"           // Off-chain standard voting
  | "OFFCHAIN_APPROVAL"           // Off-chain approval voting
  | "HYBRID_STANDARD"             // Hybrid on/off-chain standard
  | "HYBRID_APPROVAL"             // Hybrid on/off-chain approval
  | "HYBRID_OPTIMISTIC"           // Hybrid on/off-chain optimistic
  | "HYBRID_OPTIMISTIC_TIERED"    // Hybrid optimistic with tiers
```

### 2. Proposal Categories

#### STANDARD/BASIC Proposals
- **Description**: Simple yes/no/abstain voting on a single action
- **Use Case**: Protocol upgrades, parameter changes, simple treasury transfers
- **Structure**:
  - `targets[]`: Contract addresses to call
  - `values[]`: ETH values to send
  - `signatures[]`: Function signatures
  - `calldatas[]`: Encoded function parameters
- **Voting**: FOR/AGAINST/ABSTAIN
- **Thresholds**: Quorum and approval threshold required

#### APPROVAL Proposals
- **Description**: Multi-choice voting for budget allocation
- **Use Case**: Grant funding, budget distributions, multi-option decisions
- **Key Features**:
  - Multiple options with individual transaction sets
  - Budget constraints and token allocation
  - Weighted voting across options
- **Settings**:
  - `maxApprovals`: Max number of options voters can select
  - `criteria`: "THRESHOLD" or "TOP_CHOICES"
  - `criteriaValue`: Percentage threshold or number of top choices
  - `budgetToken`: Token address for budget
  - `budgetAmount`: Total budget available

#### OPTIMISTIC Proposals
- **Description**: Veto-based governance where proposals pass unless vetoed
- **Use Case**: Routine operations, low-risk changes, operational efficiency
- **Mechanism**:
  - Proposals automatically pass unless disapproval threshold is reached
  - Only AGAINST votes count toward veto
  - Default disapproval threshold: 12% of votable supply
- **Benefits**: Reduces governance overhead for routine decisions

#### SNAPSHOT/SOCIAL Proposals
- **Description**: Off-chain voting via Snapshot platform
- **Use Case**: Sentiment checks, social signaling, non-binding votes
- **Types**:
  - Basic: Standard FOR/AGAINST/ABSTAIN
  - Approval: Multiple custom options
- **Features**:
  - Gas-free voting
  - Custom voting strategies
  - Flexible voting periods

#### HYBRID Proposals
- **Description**: Combines on-chain and off-chain voting with weighted participation
- **Use Case**: Multi-stakeholder governance, cross-chain coordination
- **Voting Groups & Weights**:
  - Delegates: 50% weight
  - Apps: 16.67% weight
  - Users: 16.67% weight
  - Chains: 16.67% weight
- **Variants**:
  - `HYBRID_STANDARD`: Weighted voting across groups
  - `HYBRID_APPROVAL`: Budget allocation with group participation
  - `HYBRID_OPTIMISTIC`: Veto mechanism across all groups
  - `HYBRID_OPTIMISTIC_TIERED`: Different veto thresholds per group

## Proposal Lifecycle

### Stages

```typescript
enum ProposalStage {
  ADDING_TEMP_CHECK      // Temperature check on forum (ENS)
  DRAFTING              // Creating draft proposal
  ADDING_GITHUB_PR      // GitHub PR for documentation (ENS)
  AWAITING_SUBMISSION   // Ready for sponsor/submission
  PENDING              // Submitted, waiting for voting start
  ACTIVE               // Voting period active
  SUCCEEDED            // Passed vote
  DEFEATED             // Failed vote
  QUEUED              // In timelock queue
  EXECUTED            // Proposal executed
  CANCELLED           // Proposal cancelled
  EXPIRED             // Proposal expired
}
```

### Tenant-Specific Lifecycles

#### ENS
1. Adding Temp Check ’ 2. Drafting ’ 3. Adding GitHub PR ’ 4. Awaiting Submission ’ 5. Standard Flow

#### Optimism
1. Drafting ’ 2. Awaiting Submission ’ 3. Standard Flow

#### Others (Cyber, Uniswap, etc.)
1. Drafting ’ 2. Awaiting Submission ’ 3. Standard Flow

## Proposal Creation & Gating

### Gating Types

```typescript
enum ProposalGatingType {
  MANAGER = "manager",                    // Only designated managers
  TOKEN_THRESHOLD = "token threshold",    // Minimum token holding required
  GOVERNOR_V1 = "governor v1",           // Standard governor v1 rules
}
```

### Requirements by Tenant

- **Optimism**: Manager-only (designated addresses)
- **ENS**: Token threshold (100K ENS minimum)
- **Others**: Governor v1 standard rules

## Proposal Data Structure

### Core Proposal Interface

```typescript
interface Proposal {
  // Identity
  id: string;
  proposalNumber: bigint;
  
  // Metadata
  title: string;
  description: string;
  
  // Transactions
  targets: Address[];
  values: bigint[];
  signatures: string[];
  calldatas: string[];
  
  // Status
  status: ProposalStage;
  quorumVotes: bigint;
  approvalThreshold: bigint;
  
  // Voting
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  
  // Timeline
  createdBlock: bigint;
  startBlock: bigint;
  endBlock: bigint;
  queuedBlock?: bigint;
  executedBlock?: bigint;
  
  // Type-specific data
  proposalType: ProposalType;
  proposalData?: ApprovalProposalData | OptimisticProposalData;
}
```

### Approval Proposal Data

```typescript
interface ApprovalProposalData {
  options: ApprovalOption[];
  maxApprovals: number;
  criteria: "THRESHOLD" | "TOP_CHOICES";
  criteriaValue: number;
  budgetToken: Address;
  budgetAmount: bigint;
}

interface ApprovalOption {
  title: string;
  transactions: Transaction[];
  votes: bigint;
}
```

### Transaction Types

```typescript
enum TransactionType {
  TRANSFER = "transfer",  // Simple token transfer
  CUSTOM = "custom",     // Custom contract call
}

interface Transaction {
  type: TransactionType;
  target: Address;
  value: bigint;
  calldata: string;
  signature?: string;
  
  // For transfers
  token?: Address;
  recipient?: Address;
  amount?: bigint;
}
```

## Proposal Scopes

```typescript
enum ProposalScope {
  ONCHAIN_ONLY = "onchain_only",   // Traditional on-chain only
  OFFCHAIN_ONLY = "offchain_only", // Snapshot/off-chain only
  HYBRID = "hybrid",               // Combined on/off-chain
}
```

## Calculation Settings

### Include/Exclude Abstain Options

Some proposals allow configuration of how abstain votes are counted:

- **excludeAbstain**: Don't count abstain votes in quorum/approval calculations
- **includeAbstain**: Count abstain votes toward quorum but not approval

### Quorum & Approval Calculations

```typescript
// Standard calculation (excludeAbstain)
quorumMet = (forVotes + againstVotes) >= quorumThreshold
approvalMet = forVotes / (forVotes + againstVotes) >= approvalThreshold

// Include abstain calculation
quorumMet = (forVotes + againstVotes + abstainVotes) >= quorumThreshold
approvalMet = forVotes / (forVotes + againstVotes) >= approvalThreshold
```

## Tenant-Specific Configurations

### Enabled Proposal Types by Tenant

| Tenant | Standard | Approval | Optimistic | Snapshot | Hybrid |
|--------|----------|----------|------------|----------|---------|
| Optimism |  |  |  |  |  |
| ENS |  |  |  |  |  |
| Cyber |  |  |  |  |  |
| Uniswap |  |  |  |  |  |
| Scroll |  |  |  |  |  |

### Special Features

#### Optimism
- Hybrid voting with 4 stakeholder groups
- Advanced delegation via Alligator
- Off-chain proposal support
- Tiered optimistic proposals

#### ENS
- Snapshot integration for social proposals
- GitHub PR requirement
- Temperature check phase
- 100K ENS proposal threshold

## Utility Functions

Key proposal utilities in `/src/lib/proposalUtils.ts`:

- `parseProposalData()`: Parse raw proposal data into typed structures
- `parseProposalResults()`: Process voting results with type-specific logic
- `getProposalStatus()`: Determine current proposal state
- `calculateHybridApprovalMetrics()`: Calculate weighted voting for hybrid proposals
- `calculateOptimisticProposalMetrics()`: Calculate veto thresholds
- `getProposalTypeDisplayName()`: Get human-readable proposal type names
- `getProposalTypeDescription()`: Get detailed proposal type descriptions

## Best Practices

### When to Use Each Proposal Type

1. **STANDARD**: Protocol upgrades, parameter changes, simple decisions
2. **APPROVAL**: Grant funding, budget allocation, multi-option choices
3. **OPTIMISTIC**: Routine operations, low-risk changes, operational efficiency
4. **SNAPSHOT**: Temperature checks, sentiment gathering, social coordination
5. **HYBRID**: Cross-chain governance, multi-stakeholder decisions

### Proposal Creation Guidelines

1. Use clear, descriptive titles (max 100 characters)
2. Provide comprehensive descriptions with context and rationale
3. Include all necessary transaction details
4. Set appropriate voting periods based on proposal importance
5. Consider gas costs and choose appropriate proposal type
6. For approval proposals, ensure budget constraints are realistic
7. For optimistic proposals, evaluate appropriate veto thresholds

### Security Considerations

1. Validate all transaction parameters
2. Use simulation tools to test proposal execution
3. Consider timelock delays for critical changes
4. Ensure proper access control for proposal creation
5. Monitor for proposal spam or governance attacks