# Voting Specification

## Overview

This document outlines the comprehensive voting system implemented in Agora Next, covering vote types, voting power calculations, casting mechanisms, and tenant-specific configurations.

## Vote Support Values

The system supports three primary vote options:

```typescript
enum VoteSupport {
  FOR = 1,      // Vote in favor of the proposal
  AGAINST = 0,  // Vote against the proposal
  ABSTAIN = 2,  // Abstain from voting
}
```

### Vote Semantics

- **FOR**: Supports the proposal's execution
- **AGAINST**: Opposes the proposal's execution
- **ABSTAIN**: Neutral position, counts for quorum but not approval

## Voting Power Types

### 1. Direct Voting Power (directVP)

**Description**: Voting power held directly by the address through token ownership.

**Sources**:
- Token balance at proposal snapshot
- Self-delegated tokens
- Direct token holdings

**Calculation**:
```typescript
directVP = token.balanceOf(address, proposalSnapshot)
```

### 2. Advanced Voting Power (advancedVP)

**Description**: Voting power received through advanced delegation (Alligator).

**Sources**:
- Subdelegations via Alligator contract
- Authority chain delegations
- Calculated based on delegation rules

**Calculation**:
```typescript
advancedVP = alligator.getVotingPower(address, proposalId)
```

### 3. Total Voting Power (totalVP)

**Description**: Combined voting power from all sources.

**Calculation**:
```typescript
totalVP = directVP + advancedVP
```

## Voting Mechanisms

### 1. Standard Voting

**Hook**: `useStandardVoting`

**Description**: Direct on-chain voting through governor contract.

**Methods**:
```solidity
castVote(proposalId, support)
castVoteWithReason(proposalId, support, reason)
```

**Features**:
- Simple transaction-based voting
- Optional reason string
- Gas costs borne by voter
- Immediate on-chain recording

### 2. Advanced Voting

**Hook**: `useAdvancedVoting`

**Description**: Voting through Alligator contract with delegated power.

**Method**:
```solidity
limitedCastVoteWithReasonAndParamsBatched(
  authority,
  proposalId,
  support,
  reason,
  params
)
```

**Features**:
- Supports authority chains
- Batch voting for multiple authorities
- Respects delegation rules
- Complex validation logic

### 3. Sponsored Voting

**Hook**: `useSponsoredVoting`

**Description**: Gas-free voting using EIP-712 signatures.

**Process**:
1. User signs vote message off-chain
2. Sponsor collects signatures
3. Sponsor submits batch on-chain
4. No gas cost for voters

**Method**:
```solidity
castVoteBySig(proposalId, support, v, r, s)
```

**Constraints**:
- Minimum voting power threshold (varies by tenant)
- No voting reason allowed
- Signature expiration time
- Nonce management for replay protection

### 4. Smart Contract Wallet (SCW) Voting

**Hook**: `useScwVoting`

**Description**: Voting through smart contract wallets using account abstraction.

**Features**:
- ERC-4337 user operations
- Bundled transactions
- Different UX flow
- Special analytics tracking

## Voting Types by Proposal

### 1. Standard Voting (Single Choice)

**Proposals**: STANDARD, OFFCHAIN_STANDARD, HYBRID_STANDARD

**Options**: FOR, AGAINST, ABSTAIN

**Calculation**:
```typescript
passed = (forVotes / (forVotes + againstVotes)) >= approvalThreshold
  && (forVotes + againstVotes + abstainVotes?) >= quorum
```

### 2. Approval Voting (Multi-Choice)

**Proposals**: APPROVAL, OFFCHAIN_APPROVAL, HYBRID_APPROVAL

**Features**:
- Vote for multiple options
- `maxApprovals` limit per voter
- Budget constraints
- Weighted allocation

**Selection Criteria**:
- **TOP_CHOICES**: Select top N options by votes
- **THRESHOLD**: Options meeting minimum percentage

### 3. Optimistic Voting (Veto-Based)

**Proposals**: OPTIMISTIC, OFFCHAIN_OPTIMISTIC, HYBRID_OPTIMISTIC

**Mechanism**:
- Only AGAINST votes matter
- Proposals pass unless veto threshold reached
- No quorum requirement

**Calculation**:
```typescript
vetoed = againstVotes >= (totalSupply * disapprovalThreshold)
passed = !vetoed
```

### 4. Hybrid Voting (Multi-Stakeholder)

**Proposals**: All HYBRID_* types

**Voting Groups & Weights**:
```typescript
const HYBRID_VOTE_WEIGHTS = {
  delegates: 0.5000,  // 50% weight
  apps: 0.1667,      // 16.67% weight
  users: 0.1667,     // 16.67% weight
  chains: 0.1667     // 16.67% weight
}
```

**Thresholds**:
- Apps: 100 minimum votes
- Users: 1000 minimum votes
- Chains: 15 minimum votes

**Calculation**:
```typescript
weightedPercentage = 
  (delegatesPct * 0.5) + 
  (appsPct * 0.1667) + 
  (usersPct * 0.1667) + 
  (chainsPct * 0.1667)
```

## Vote Casting Flow

### 1. Pre-Vote Checks

```typescript
interface VotingChecks {
  hasDirectVP: boolean;
  hasAdvancedVP: boolean;
  alreadyVoted: boolean;
  proposalActive: boolean;
  meetsMinimumVP: boolean;
}
```

### 2. Missing Vote Detection

```typescript
enum MissingVoteType {
  DIRECT = "DIRECT",     // Has direct VP but hasn't voted
  ADVANCED = "ADVANCED", // Has advanced VP but hasn't voted
  BOTH = "BOTH",        // Has both types but hasn't voted
  NONE = "NONE"         // No voting power or already voted
}
```

### 3. Vote Submission Flow

1. **Check Eligibility**: Verify voting power and proposal status
2. **Select Mechanism**: Choose based on available options:
   - Sponsored (if available and meets threshold)
   - Advanced (if has delegated power)
   - Standard (default)
   - SCW (if using smart wallet)
3. **Prepare Transaction/Signature**: Build appropriate call data
4. **Submit Vote**: Execute transaction or submit signature
5. **Track Analytics**: Record voting event
6. **Show Confirmation**: Display success dialog with sharing options

## Voting Rules & Thresholds

### Standard Thresholds

```typescript
interface VotingThresholds {
  quorum: bigint;           // Minimum participation (e.g., 30%)
  approvalThreshold: bigint; // Minimum approval (e.g., 50%)
  votingPeriod: bigint;     // Blocks for voting (e.g., 7 days)
  votingDelay: bigint;      // Blocks before voting starts
}
```

### Tenant-Specific Configurations

| Tenant | Quorum | Approval | Period | Special Rules |
|--------|---------|----------|---------|---------------|
| Optimism | 30% | 50% | 7 days | Optimistic proposals: 12% veto |
| ENS | 1% | 50% | 7 days | Snapshot integration |
| Uniswap | 4% | 50% | 7 days | Bravo governor |
| Cyber | Variable | 50% | 5 days | Endorsed delegates |

### Calculation Options

**excludeAbstain** (default):
```typescript
quorumMet = (forVotes + againstVotes) >= quorumThreshold
approvalMet = forVotes / (forVotes + againstVotes) >= approvalThreshold
```

**includeAbstain**:
```typescript
quorumMet = (forVotes + againstVotes + abstainVotes) >= quorumThreshold
approvalMet = forVotes / (forVotes + againstVotes) >= approvalThreshold
```

## UI Components

### Core Components

1. **CastVoteDialog**
   - Main voting interface
   - Support selection (FOR/AGAINST/ABSTAIN)
   - Reason input (optional)
   - Transaction confirmation

2. **ApprovalCastVoteDialog**
   - Multi-choice interface
   - Option selection up to maxApprovals
   - Budget visualization
   - Approval criteria display

3. **ProposalVotesList**
   - Display all votes
   - Filter by support type
   - Pagination support
   - Delegate information

4. **VotesBar**
   - Visual vote distribution
   - Color-coded by support
   - Percentage display
   - Threshold indicators

5. **ShareVoteDialog**
   - Social sharing options
   - Custom messages
   - Platform integration
   - Analytics tracking

### Vote Display Components

- `VoteDisplay`: Individual vote record
- `VoterHoverCard`: Voter information popup
- `VotingPowerDisplay`: VP breakdown
- `VoteReasonDisplay`: Formatted vote reasons

## Analytics & Tracking

### Events

```typescript
// Vote casting events
CAST_VOTE               // Standard vote
ADVANCED_CAST_VOTE      // Alligator vote
SPONSORED_CAST_VOTE     // Gas-free vote
SCW_CAST_VOTE          // Smart wallet vote

// Vote sharing events
SHARE_VOTE_TWITTER     // Twitter share
SHARE_VOTE_FARCASTER   // Farcaster share
SHARE_VOTE_COPY_LINK   // Link copied

// UI interaction events
VOTE_DIALOG_OPENED     // Dialog opened
VOTE_SUPPORT_SELECTED  // Option selected
VOTE_REASON_ADDED      // Reason provided
```

### Metrics

- Vote participation rate
- Voting power utilization
- Mechanism usage distribution
- Time to vote patterns
- Reason provision rate

## Cross-Chain Considerations

### Block Number Mapping

Different chains have different block times:
```typescript
const BLOCK_TIMES = {
  optimism: 2,
  base: 2,
  arbitrum: 0.25,
  ethereum: 12,
  scroll: 3,
}
```

### Time Calculations

```typescript
function getVoteEndTime(endBlock: bigint, chainId: number): Date {
  const currentBlock = await getBlockNumber(chainId);
  const blocksRemaining = endBlock - currentBlock;
  const secondsRemaining = blocksRemaining * BLOCK_TIMES[chainId];
  return new Date(Date.now() + secondsRemaining * 1000);
}
```

## Best Practices

### For Voters

1. **Review Proposals Carefully**: Read full descriptions and discussions
2. **Vote Early**: Avoid last-minute voting to prevent issues
3. **Provide Reasons**: Help others understand your position
4. **Delegate if Inactive**: Better to delegate than not participate
5. **Verify Transactions**: Check vote was recorded correctly

### For Delegates

1. **Vote Consistently**: Maintain predictable voting patterns
2. **Explain Positions**: Always provide voting reasons
3. **Communicate Changes**: Notify delegators of position changes
4. **Respect Delegations**: Vote according to stated philosophy
5. **Track Participation**: Maintain high voting rate

### For Developers

1. **Handle Edge Cases**: Account for all voting power types
2. **Optimize Gas**: Batch operations where possible
3. **Validate Inputs**: Check all parameters before submission
4. **Clear UX**: Make voting options and implications clear
5. **Track Errors**: Monitor failed voting attempts

## Security Considerations

### Attack Vectors

1. **Flash Loan Attacks**: Temporary voting power manipulation
2. **Governance Attacks**: Coordinated malicious voting
3. **Sybil Attacks**: Multiple accounts to bypass thresholds
4. **MEV Exploitation**: Front-running vote transactions
5. **Signature Replay**: Reusing sponsored vote signatures

### Mitigations

1. **Snapshot Blocks**: Use historical balances for voting power
2. **Time Delays**: Voting delay before proposal active
3. **Minimum Thresholds**: Require meaningful participation
4. **Signature Expiration**: Time-limited sponsored votes
5. **Nonce Tracking**: Prevent signature replay

## Future Enhancements

### Potential Features

1. **Quadratic Voting**: Non-linear voting power allocation
2. **Conviction Voting**: Time-weighted continuous voting
3. **Prediction Markets**: Betting on proposal outcomes
4. **Delegation Voting**: Temporary proposal-specific delegation
5. **Privacy Voting**: Zero-knowledge voting proofs
6. **Incentivized Voting**: Rewards for participation
7. **Liquid Democracy**: Dynamic delegation during voting