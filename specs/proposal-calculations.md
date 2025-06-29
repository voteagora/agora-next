# Proposal Calculations Specification

## Overview

This document specifies the exact calculations for each proposal type, including quorum, approval thresholds, and type-specific metrics. It serves as the source of truth for verifying calculation correctness across old and new implementations.

## Core Calculation Principles

### Voting Power
- **Direct VP**: Token balance at proposal snapshot
- **Advanced VP**: Delegated power via Alligator
- **Total VP**: Direct VP + Advanced VP

### Base Calculations
```typescript
// Participation calculation
participationVotes = forVotes + againstVotes + (includeAbstain ? abstainVotes : 0n)
participationRate = (participationVotes * 100) / votableSupply

// Approval calculation
approvalRate = (forVotes * 100) / (forVotes + againstVotes)
```

## 1. STANDARD Proposals

### Vote Counting
```typescript
forVotes: bigint      // Votes in favor
againstVotes: bigint  // Votes against
abstainVotes: bigint  // Abstain votes
```

### Quorum Calculation
```typescript
// Default: Exclude abstain from quorum
quorumVotes = forVotes + againstVotes
quorumMet = quorumVotes >= quorumThreshold

// With includeAbstain = true
quorumVotes = forVotes + againstVotes + abstainVotes
quorumMet = quorumVotes >= quorumThreshold
```

### Approval Calculation
```typescript
// Approval is always calculated without abstain
approvalRate = forVotes / (forVotes + againstVotes) * 100
approvalMet = approvalRate >= approvalThreshold
```

### Status Determination
```typescript
if (cancelled) return CANCELLED
if (executed) return EXECUTED
if (queued) return QUEUED
if (currentBlock <= endBlock && currentBlock >= startBlock) return ACTIVE
if (currentBlock < startBlock) return PENDING
if (currentBlock > endBlock) {
  if (quorumMet && approvalMet) return SUCCEEDED
  else return DEFEATED
}
```

### Example Calculation
```
Given:
- votableSupply: 1,000,000
- quorumThreshold: 40,000 (4%)
- approvalThreshold: 50%
- forVotes: 30,000
- againstVotes: 15,000
- abstainVotes: 5,000

Results:
- quorumVotes: 45,000 (excluding abstain)
- quorumMet: true (45,000 >= 40,000)
- approvalRate: 66.67% (30,000 / 45,000)
- approvalMet: true (66.67% >= 50%)
- Status: SUCCEEDED (if ended)
```

## 2. APPROVAL Proposals

### Vote Distribution
```typescript
interface ApprovalOption {
  title: string
  votes: bigint
  transactions: Transaction[]
}
```

### Criteria Types

#### TOP_CHOICES
```typescript
// Sort options by votes descending
sortedOptions = options.sort((a, b) => b.votes - a.votes)

// Select top N options
selectedOptions = sortedOptions.slice(0, criteriaValue)
```

#### THRESHOLD
```typescript
// Calculate percentage for each option
optionPercentage = (option.votes * 100) / totalVotes

// Select options meeting threshold
selectedOptions = options.filter(opt => 
  (opt.votes * 100 / totalVotes) >= criteriaValue
)
```

### Budget Calculation
```typescript
// Calculate total budget usage
budgetUsed = selectedOptions.reduce((sum, option) => {
  const transfers = option.transactions.filter(tx => tx.type === 'TRANSFER')
  const optionBudget = transfers.reduce((txSum, tx) => txSum + tx.amount, 0n)
  return sum + optionBudget
}, 0n)

budgetUtilization = (budgetUsed * 100) / budgetAmount
```

### Quorum and Approval
```typescript
// Total votes across all options
totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0n)

// Quorum based on total participation
quorumMet = totalVotes >= quorumThreshold

// Approval met if at least one option selected
approvalMet = selectedOptions.length > 0
```

### Example Calculation
```
Given:
- votableSupply: 1,000,000
- quorumThreshold: 40,000
- maxApprovals: 3
- criteria: TOP_CHOICES
- criteriaValue: 2
- budgetAmount: 100,000

Options:
- Option A: 20,000 votes, 30,000 budget
- Option B: 15,000 votes, 25,000 budget
- Option C: 10,000 votes, 20,000 budget
- Option D: 5,000 votes, 15,000 budget

Results:
- totalVotes: 50,000
- quorumMet: true (50,000 >= 40,000)
- selectedOptions: [Option A, Option B]
- budgetUsed: 55,000
- budgetUtilization: 55%
- approvalMet: true (2 options selected)
```

## 3. OPTIMISTIC Proposals

### Veto Mechanism
```typescript
// Only against votes count toward veto
vetoVotes = againstVotes

// Default disapproval threshold: 12%
disapprovalThreshold = proposalConfig.disapprovalThreshold || 12

// Calculate veto threshold
vetoThreshold = (votableSupply * disapprovalThreshold) / 100

// Check if vetoed
isVetoed = vetoVotes >= vetoThreshold
```

### Veto Progress
```typescript
vetoProgress = (vetoVotes * 100) / vetoThreshold
// Capped at 100%
vetoProgress = Math.min(vetoProgress, 100)
```

### Status Determination
```typescript
// No quorum requirement for optimistic
quorumMet = true

// Proposal passes unless vetoed
approvalMet = !isVetoed

// Status logic
if (currentBlock > endBlock) {
  if (isVetoed) return DEFEATED
  else return SUCCEEDED
}
```

### Example Calculation
```
Given:
- votableSupply: 1,000,000
- disapprovalThreshold: 12%
- forVotes: 5,000
- againstVotes: 100,000
- abstainVotes: 10,000

Results:
- vetoThreshold: 120,000 (12% of 1M)
- vetoVotes: 100,000
- isVetoed: false (100,000 < 120,000)
- vetoProgress: 83.33%
- approvalMet: true (not vetoed)
- Status: SUCCEEDED (if ended)
```

## 4. HYBRID Proposals

### Voting Groups
```typescript
const VOTING_WEIGHTS = {
  delegates: 0.5000,   // 50%
  apps: 0.1667,       // 16.67%
  users: 0.1667,      // 16.67%
  chains: 0.1667      // 16.67%
}

const MINIMUM_VOTES = {
  apps: 100n,
  users: 1000n,
  chains: 15n
}
```

### Group Participation
```typescript
// For each group
groupParticipation = groupFor + groupAgainst
groupParticipationRate = (groupParticipation * 100) / groupEligible

// Check minimum threshold
groupMeetsMinimum = groupParticipation >= MINIMUM_VOTES[group]
```

### Weighted Calculation
```typescript
// Calculate approval for each group
groupApprovalRate = (groupFor * 100) / (groupFor + groupAgainst)

// Calculate weighted average (only for groups meeting minimum)
weightedApproval = 0
totalWeight = 0

for (const group of groups) {
  if (group.meetsMinimum) {
    weightedApproval += group.approvalRate * group.weight
    totalWeight += group.weight
  }
}

finalApprovalRate = weightedApproval / totalWeight
```

### Quorum for Hybrid
```typescript
// Count groups that meet minimum participation
participatingGroups = groups.filter(g => g.meetsMinimum).length

// Require at least 3 of 4 groups
quorumMet = participatingGroups >= 3
```

### Example Calculation
```
Given:
- Delegates: 10,000 for, 5,000 against (eligible: 100,000)
- Apps: 150 for, 50 against (eligible: 500)
- Users: 2,000 for, 1,000 against (eligible: 10,000)
- Chains: 20 for, 5 against (eligible: 50)

Results per group:
- Delegates: 66.67% approval, 15% participation, meets minimum ✓
- Apps: 75% approval, 40% participation, meets minimum ✓ (200 > 100)
- Users: 66.67% approval, 30% participation, meets minimum ✓ (3,000 > 1,000)
- Chains: 80% approval, 50% participation, meets minimum ✓ (25 > 15)

Weighted calculation:
- Total weight: 1.0000 (all groups participated)
- Weighted approval: (66.67% × 0.5) + (75% × 0.1667) + (66.67% × 0.1667) + (80% × 0.1667)
- Final approval: 70.28%
- Quorum met: true (4 groups participated)
```

## 5. HYBRID_OPTIMISTIC Proposals

### Veto Calculation per Group
```typescript
// Each group has its own veto calculation
groupVetoProgress = (groupAgainst * 100) / (groupEligible * disapprovalThreshold / 100)

// Group is vetoed if against votes exceed threshold
groupIsVetoed = groupAgainst >= (groupEligible * disapprovalThreshold / 100)
```

### Overall Veto Status
```typescript
// Different strategies possible:
// Option 1: Any group can veto
overallVetoed = groups.some(g => g.isVetoed)

// Option 2: Weighted veto (current implementation)
weightedVetoRate = groups.reduce((sum, group) => {
  if (group.meetsMinimum) {
    return sum + (group.vetoProgress * group.weight)
  }
  return sum
}, 0) / totalWeight

overallVetoed = weightedVetoRate >= 100
```

## 6. OFFCHAIN Proposals

### Attestation Verification
```typescript
// Offchain proposals include attestation data
interface OffchainProposalData {
  attestationHash: string
  attestationData: {
    forVotes: bigint
    againstVotes: bigint
    abstainVotes: bigint
  }
}

// Calculations same as onchain equivalents
// but data comes from attestations
```

## Special Cases and Edge Conditions

### Division by Zero
```typescript
// Always check denominators
approvalRate = (forVotes + againstVotes) > 0n 
  ? (forVotes * 100) / (forVotes + againstVotes)
  : 0

participationRate = votableSupply > 0n
  ? (participationVotes * 100) / votableSupply
  : 0
```

### Precision Handling
```typescript
// Use basis points (10000) for better precision
approvalRateBPS = (forVotes * 10000n) / (forVotes + againstVotes)
approvalRate = Number(approvalRateBPS) / 100
```

### Overflow Protection
```typescript
// For very large numbers, check for overflow
try {
  const result = (votes * 10000n) / total
  return Number(result) / 100
} catch (error) {
  // Handle overflow gracefully
  return 0
}
```

## Validation Tests

### Test Case 1: Standard Proposal Edge Cases
```typescript
// Test: No votes
{
  forVotes: 0n,
  againstVotes: 0n,
  abstainVotes: 0n,
  expected: {
    quorumMet: false,
    approvalRate: 0,
    participationRate: 0
  }
}

// Test: Only abstain votes
{
  forVotes: 0n,
  againstVotes: 0n,
  abstainVotes: 10000n,
  excludeAbstain: true,
  expected: {
    quorumMet: false,
    approvalRate: 0,
    participationRate: 0
  }
}

// Test: 100% approval
{
  forVotes: 50000n,
  againstVotes: 0n,
  abstainVotes: 5000n,
  expected: {
    quorumMet: true,
    approvalRate: 100,
    participationRate: 5
  }
}
```

### Test Case 2: Approval Proposal Edge Cases
```typescript
// Test: No votes on any option
{
  options: [
    { title: "A", votes: 0n },
    { title: "B", votes: 0n }
  ],
  expected: {
    selectedOptions: [],
    quorumMet: false,
    approvalMet: false
  }
}

// Test: Equal votes with TOP_CHOICES
{
  options: [
    { title: "A", votes: 1000n },
    { title: "B", votes: 1000n },
    { title: "C", votes: 1000n }
  ],
  criteria: "TOP_CHOICES",
  criteriaValue: 2,
  expected: {
    selectedOptions: ["A", "B"], // First 2 by order
    quorumMet: true
  }
}
```

### Test Case 3: Optimistic Edge Cases
```typescript
// Test: Exactly at veto threshold
{
  votableSupply: 1000000n,
  disapprovalThreshold: 12,
  againstVotes: 120000n,
  expected: {
    isVetoed: true,
    vetoProgress: 100
  }
}

// Test: One vote below veto
{
  votableSupply: 1000000n,
  disapprovalThreshold: 12,
  againstVotes: 119999n,
  expected: {
    isVetoed: false,
    vetoProgress: 99.999
  }
}
```

## Implementation Verification

To verify the new system matches these calculations:

```typescript
// Create test suite comparing old and new
async function verifyCalculations(proposalData: any) {
  // Old system
  const oldResult = parseProposal(proposalData);
  const oldMetrics = calculateOldMetrics(oldResult);
  
  // New system
  const proposal = ProposalAdapter.toDomainModel(proposalData, votableSupply);
  const newMetrics = proposal.getMetrics();
  
  // Compare
  expect(newMetrics.quorumMet).toBe(oldMetrics.quorumMet);
  expect(newMetrics.approvalRate).toBeCloseTo(oldMetrics.approvalRate, 2);
  expect(newMetrics.participationRate).toBeCloseTo(oldMetrics.participationRate, 2);
}
```