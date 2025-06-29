# Implementation Fixes Required

Based on the analysis of the existing proposalUtils.ts, our new implementation needs several fixes to match the exact behavior:

## 1. Standard Proposal Calculations

### Current Issues:
- Need tenant-specific quorum calculations
- Missing calculation options handling
- Status determination logic needs adjustment

### Required Fixes:

```typescript
// In StandardProposalStrategy.calculateMetrics()
calculateMetrics(proposal: Proposal): ProposalMetrics {
  const results = proposal.getResults();
  const quorumVotes = proposal.getQuorumVotes();
  const approvalThreshold = proposal.getApprovalThreshold();
  const votableSupply = proposal.getVotableSupply();
  
  // FIX 1: Get tenant-specific quorum calculation
  const tenant = this.getTenant(proposal); // Need to add this method
  const calculationOptions = this.getCalculationOptions(proposal); // Need to add this
  
  let participationVotes: bigint;
  
  switch (tenant) {
    case TENANT_NAMESPACES.UNISWAP:
      // Only FOR votes count for quorum
      participationVotes = results.forVotes;
      break;
    case TENANT_NAMESPACES.SCROLL:
      // All votes count for quorum  
      participationVotes = results.forVotes + results.againstVotes + results.abstainVotes;
      break;
    case TENANT_NAMESPACES.OPTIMISM:
      if (calculationOptions === 1) {
        participationVotes = results.forVotes; // Only FOR votes
      } else {
        participationVotes = results.forVotes + results.abstainVotes; // FOR + ABSTAIN (default)
      }
      break;
    default:
      // DEFAULT: FOR + ABSTAIN
      participationVotes = results.forVotes + results.abstainVotes;
  }
  
  const quorumMet = participationVotes >= quorumVotes;
  
  // FIX 2: Approval calculation (always excludes abstain)
  const totalOpinionVotes = results.forVotes + results.againstVotes;
  const approvalRate = totalOpinionVotes > 0n
    ? Number((results.forVotes * 10000n) / totalOpinionVotes) / 100
    : 0;
  
  const approvalMet = results.forVotes > results.againstVotes; // Simple majority logic
  
  // Participation rate calculation
  const participationRate = votableSupply > 0n
    ? Number((participationVotes * 10000n) / votableSupply) / 100
    : 0;

  return {
    quorumMet,
    approvalMet,
    participationRate,
    approvalRate,
  };
}

// FIX 3: Status determination for standard proposals
protected determineEndedStatus(metrics: ProposalMetrics): ProposalStatus {
  const results = this.proposal.getResults();
  
  // Check quorum first, then approval
  if (!metrics.quorumMet || results.forVotes <= results.againstVotes) {
    return ProposalStatus.DEFEATED;
  }
  
  if (results.forVotes > results.againstVotes) {
    return ProposalStatus.SUCCEEDED;
  }
  
  return ProposalStatus.DEFEATED; // Default to defeated
}
```

## 2. Optimistic Proposal Calculations

### Current Issues:
- Inconsistent veto thresholds (12% vs 50%)
- Need to match existing behavior exactly

### Required Fixes:

```typescript
// In OptimisticProposalStrategy.calculateMetrics()
calculateMetrics(proposal: Proposal): OptimisticMetrics {
  const results = proposal.getResults();
  const votableSupply = proposal.getVotableSupply();
  
  // FIX 1: Use correct thresholds
  const disapprovalThreshold = 12; // For metrics display
  const statusThreshold = 50; // For actual status determination
  
  // Calculate veto threshold for metrics (12%)
  const vetoThreshold = (votableSupply * BigInt(disapprovalThreshold)) / 100n;
  const vetoVotes = results.againstVotes;
  
  // Veto progress based on 12% threshold
  const vetoProgress = vetoThreshold > 0n
    ? Math.min(Number((vetoVotes * 10000n) / vetoThreshold) / 100, 100)
    : 0;
  
  // BUT status uses 50% threshold
  const statusVetoThreshold = votableSupply / 2n; // 50%
  const isVetoedForStatus = vetoVotes > statusVetoThreshold;
  
  // Display veto based on 12% for UI
  const isVetoed = vetoVotes >= vetoThreshold;
  
  return {
    quorumMet: true, // Always true for optimistic
    approvalMet: !isVetoedForStatus, // Use 50% threshold for actual status
    participationRate: Number((vetoVotes * 10000n) / votableSupply) / 100,
    approvalRate: isVetoedForStatus ? 0 : 100,
    vetoThreshold,
    vetoProgress,
    isVetoed, // For display purposes (12% threshold)
  };
}

// FIX 2: Status determination uses 50% threshold
protected determineEndedStatus(metrics: OptimisticMetrics): ProposalStatus {
  return metrics.approvalMet ? ProposalStatus.SUCCEEDED : ProposalStatus.DEFEATED;
}
```

## 3. Hybrid Proposal Calculations

### Current Issues:
- Eligible voters calculation is wrong
- Missing proper weight distribution
- Incomplete implementation

### Required Fixes:

```typescript
// In HybridProposalStrategy.calculateMetrics()
calculateMetrics(proposal: Proposal): HybridMetrics {
  const data = proposal.getData() as HybridProposalData;
  const groupMetrics: HybridMetrics["groupMetrics"] = {};
  
  // FIX 1: Correct eligible voters calculation
  const delegateQuorum = this.getDelegateQuorum(proposal); // Need to get from proposal data
  const eligibleVoters = {
    delegates: Number(delegateQuorum) * (100 / 30), // Convert 30% quorum to total eligible
    apps: 100,    // Fixed threshold
    users: 1000,  // Fixed threshold  
    chains: 15,   // Fixed threshold
  };
  
  const HYBRID_VOTE_WEIGHTS = {
    delegates: 0.5,      // 50%
    apps: 1/6,          // 16.67%
    users: 1/6,         // 16.67%
    chains: 1/6,        // 16.67%
  };
  
  let weightedApproval = 0;
  let totalWeight = 0;
  
  // FIX 2: Calculate tally for each group correctly
  for (const [groupName, groupData] of Object.entries(data.votingGroups)) {
    const forVotes = groupData.forVotes;
    const againstVotes = groupData.againstVotes;
    const abstainVotes = groupData.abstainVotes;
    const totalVotes = forVotes + againstVotes;
    
    // Apply calculation options for quorum
    let quorumVotes = forVotes + abstainVotes; // Default
    const calculationOptions = this.getCalculationOptions(proposal);
    if (calculationOptions === 1) {
      quorumVotes = forVotes; // Only FOR votes
    }
    
    const eligibleCount = eligibleVoters[groupName as keyof typeof eligibleVoters];
    const participationRate = eligibleCount > 0 
      ? Number((quorumVotes * 10000n) / BigInt(eligibleCount)) / 100
      : 0;
    
    const approvalRate = totalVotes > 0n
      ? Number((forVotes * 10000n) / totalVotes) / 100
      : 0;
    
    // Check minimum participation thresholds
    const minimumRequired = this.MINIMUM_VOTES[groupName as keyof typeof this.MINIMUM_VOTES];
    const meetsMinimum = !minimumRequired || quorumVotes >= minimumRequired;
    
    // Quorum threshold is 30%
    const quorumThreshold = 30;
    const passingQuorum = participationRate >= quorumThreshold;
    const passingApproval = totalVotes > 0n ? approvalRate >= 50 : false; // 50% approval threshold
    
    groupMetrics[groupName] = {
      participationRate,
      approvalRate,
      meetsMinimum: meetsMinimum && passingQuorum,
    };
    
    // Add to weighted calculation if group qualifies
    if (groupMetrics[groupName].meetsMinimum) {
      const weight = HYBRID_VOTE_WEIGHTS[groupName as keyof typeof HYBRID_VOTE_WEIGHTS];
      weightedApproval += approvalRate * weight;
      totalWeight += weight;
    }
  }
  
  // FIX 3: Final weighted calculations
  const weightedApprovalRate = totalWeight > 0 ? weightedApproval / totalWeight : 0;
  
  // Quorum requires at least 3 of 4 groups to participate
  const participatingGroups = Object.values(groupMetrics).filter(
    m => m.meetsMinimum
  ).length;
  const quorumMet = participatingGroups >= 3;
  
  // Approval threshold is 30% weighted
  const approvalThreshold = 30;
  const approvalMet = weightedApprovalRate >= approvalThreshold;
  
  return {
    quorumMet,
    approvalMet,
    participationRate: 0, // Calculate overall if needed
    approvalRate: weightedApprovalRate,
    groupMetrics,
    weightedApprovalRate,
  };
}
```

## 4. Hybrid Optimistic Tiered Calculations

### Current Issues:
- Complex tiered threshold logic missing
- Veto calculation across groups not implemented

### Required Fixes:

```typescript
// In HybridProposalStrategy for optimistic variants
calculateOptimisticMetrics(proposal: Proposal): HybridOptimisticMetrics {
  const data = proposal.getData() as HybridProposalData;
  const proposalData = proposal.getRawData(); // Need access to tiers
  
  // FIX 1: Get tiered thresholds
  const tiers = proposalData?.tiers || [55, 45, 35]; // Default tiers
  const thresholds = {
    twoGroups: tiers[0] / 100,    // 55% for 2 groups
    threeGroups: tiers[1] / 100,  // 45% for 3 groups  
    fourGroups: tiers[2] / 100,   // 35% for 4 groups
  };
  
  // FIX 2: Calculate veto percentage for each group
  const groupTallies = [];
  for (const [groupName, groupData] of Object.entries(data.votingGroups)) {
    const againstVotes = groupData.againstVotes;
    const totalEligible = groupData.totalEligible;
    
    const vetoPercentage = totalEligible > 0n
      ? Number((againstVotes * 10000n) / totalEligible) / 100
      : 0;
    
    groupTallies.push({
      group: groupName,
      vetoPercentage,
      againstVotes,
    });
  }
  
  // FIX 3: Apply tiered veto logic
  let vetoTriggered = false;
  
  // Check if 4+ groups exceed 4-group threshold
  const groupsExceedingFourThreshold = groupTallies.filter(
    (g) => g.vetoPercentage >= thresholds.fourGroups
  );
  if (groupsExceedingFourThreshold.length >= 4) {
    vetoTriggered = true;
  } 
  // Check if 3+ groups exceed 3-group threshold
  else if (groupTallies.filter((g) => g.vetoPercentage >= thresholds.threeGroups).length >= 3) {
    vetoTriggered = true;
  } 
  // Check if 2+ groups exceed 2-group threshold
  else if (groupTallies.filter((g) => g.vetoPercentage >= thresholds.twoGroups).length >= 2) {
    vetoTriggered = true;
  }
  
  return {
    quorumMet: true, // Always true for optimistic
    approvalMet: !vetoTriggered,
    participationRate: 0, // Calculate if needed
    approvalRate: vetoTriggered ? 0 : 100,
    groupTallies,
    vetoTriggered,
    thresholds,
  };
}
```

## 5. Additional Required Changes

### A. Add Tenant Context to Strategies

```typescript
// Need to modify base strategy to include tenant context
export abstract class BaseProposalStrategy implements ProposalStrategy {
  constructor(protected tenant?: TENANT_NAMESPACES) {}
  
  protected getTenant(proposal: Proposal): TENANT_NAMESPACES {
    // Extract tenant from proposal context or use constructor value
    return this.tenant || TENANT_NAMESPACES.OPTIMISM; // Default
  }
  
  protected getCalculationOptions(proposal: Proposal): number {
    // Extract calculation options from proposal data
    const rawData = proposal.getRawData();
    return rawData?.calculationOptions || 0; // Default
  }
}
```

### B. Handle Optimism V6 Upgrade Logic

```typescript
// In vote parsing, need to handle pre/post upgrade vote ordering
protected parseResults(rawResults: any): ProposalResults {
  const startBlock = this.getStartBlock();
  const contracts = this.getContracts();
  
  // Handle Optimism V6 upgrade vote ordering change
  if (this.tenant === TENANT_NAMESPACES.OPTIMISM && 
      contracts?.governor?.v6UpgradeBlock && 
      Number(startBlock) < contracts.governor.v6UpgradeBlock) {
    
    // Pre-upgrade ordering
    return {
      forVotes: BigInt(rawResults.standard?.[0] ?? 0),
      againstVotes: 0n,
      abstainVotes: BigInt(rawResults.standard?.[1] ?? 0),
    };
  }
  
  // Post-upgrade ordering (standard)
  return {
    forVotes: BigInt(rawResults.forVotes || rawResults.for_votes || 0),
    againstVotes: BigInt(rawResults.againstVotes || rawResults.against_votes || 0),
    abstainVotes: BigInt(rawResults.abstainVotes || rawResults.abstain_votes || 0),
  };
}
```

### C. Budget Calculations for Approval Proposals

```typescript
// Need to add budget change date logic for approval proposals
protected calculateBudgetUtilization(proposal: Proposal, selectedOptions: ApprovalOption[]): number {
  const data = proposal.getData() as ApprovalProposalData;
  const createdAt = proposal.getTimeline().createdBlock;
  
  // Check if proposal was created before budget change
  const budgetChangeDate = this.getBudgetChangeDate(); // Need to implement
  const useOldBudgetLogic = createdAt < budgetChangeDate;
  
  if (useOldBudgetLogic) {
    // Use old budget calculation logic
    return this.calculateOldBudgetUtilization(selectedOptions);
  }
  
  // Use current budget calculation
  const budgetUsed = selectedOptions.reduce((sum, option) => {
    const transfers = option.transactions.filter(tx => tx.type === 'TRANSFER');
    const optionBudget = transfers.reduce((txSum, tx) => txSum + (tx.amount || 0n), 0n);
    return sum + optionBudget;
  }, 0n);
  
  return data.budgetAmount && data.budgetAmount > 0n
    ? Number((budgetUsed * 10000n) / data.budgetAmount) / 100
    : 0;
}
```

## 6. Testing Strategy

To ensure our fixes work correctly:

1. **Run the verification test suite** with the original test cases
2. **Compare outputs** between old and new systems for each test case
3. **Fix discrepancies** one by one until all tests pass
4. **Add edge case tests** for the complex scenarios we discovered

## Priority for Implementation

1. **High Priority**: Standard and Optimistic calculations (most common)
2. **Medium Priority**: Hybrid calculations (Optimism-specific)  
3. **Low Priority**: Edge cases and special tenant logic

These fixes will ensure our new implementation exactly matches the existing behavior while maintaining the clean architecture we've built.