# Proposal Calculations Summary

## Overview

This document summarizes the calculation specifications for all proposal types and provides a roadmap for ensuring the new domain-driven architecture exactly matches the existing implementation.

## Files Created

1. **`proposal-calculations.md`** - Detailed mathematical specifications for each proposal type
2. **`calculation-verification.md`** - Comprehensive test suite to verify calculation parity  
3. **`implementation-fixes.md`** - Required fixes to match existing behavior exactly

## Key Findings from Analysis

### 1. Calculation Complexity
The existing system has significant complexity that must be preserved:
- **Tenant-specific logic** for quorum calculations
- **Calculation options** that affect how abstain votes are counted
- **Historical compatibility** (Optimism V6 upgrade logic)
- **Inconsistent thresholds** (optimistic proposals use different thresholds for display vs status)

### 2. Critical Discrepancies Found

#### Standard Proposals
- **Quorum calculation varies by tenant**:
  - UNISWAP: Only FOR votes count
  - SCROLL: ALL votes count (FOR + AGAINST + ABSTAIN)
  - OPTIMISM: FOR + ABSTAIN (default) or only FOR (calculation option 1)
  - Others: FOR + ABSTAIN

#### Optimistic Proposals  
- **Inconsistent veto thresholds**:
  - Metrics display: 12% threshold
  - Status determination: 50% threshold
  - This inconsistency exists in current system and must be preserved

#### Hybrid Proposals
- **Complex eligible voter calculations**:
  - Delegates: Derived from 30% quorum threshold
  - Apps: Fixed at 100
  - Users: Fixed at 1,000  
  - Chains: Fixed at 15
- **Weighted approval requires 3+ groups participating**
- **30% final approval threshold**

#### Hybrid Optimistic Tiered
- **Tiered veto thresholds**:
  - 2 groups: 55% threshold
  - 3 groups: 45% threshold
  - 4 groups: 35% threshold
- **Complex cascading veto logic**

### 3. Edge Cases to Handle
- **Division by zero** in approval calculations
- **Empty vote results** handling
- **Large number overflow** protection
- **Historical vote ordering** (pre/post Optimism V6)
- **Budget change dates** for approval proposals

## Implementation Status

### ✅ Completed (Phase 1 & 2)
- Domain architecture setup
- Base proposal strategies
- Factory and registry patterns
- Repository implementation
- Migration adapters

### 🔧 Requires Fixes
- **Standard proposal quorum calculations** (tenant-specific)
- **Optimistic veto thresholds** (dual threshold system)
- **Hybrid eligible voter calculations** (complex derivation)
- **Hybrid weighted approval** (3+ group requirement)
- **Tiered optimistic veto logic** (cascading thresholds)

### 📋 Testing Required
- **Calculation verification test suite** (comprehensive)
- **Edge case validation** (division by zero, etc.)
- **Cross-tenant testing** (different calculation rules)
- **Historical compatibility** (pre/post upgrade logic)

## Recommended Implementation Approach

### Phase 1: Core Fixes (Week 1)
1. **Fix standard proposal calculations**
   - Add tenant-specific quorum logic
   - Implement calculation options handling
   - Update status determination

2. **Fix optimistic calculations**
   - Implement dual threshold system (12% vs 50%)
   - Preserve the inconsistency for compatibility

3. **Create verification tests**
   - Implement the test suite from `calculation-verification.md`
   - Run against existing data samples
   - Fix discrepancies iteratively

### Phase 2: Advanced Types (Week 2)
1. **Fix hybrid calculations**
   - Implement correct eligible voter derivation
   - Add 3+ group participation requirement
   - Fix weighted approval calculations

2. **Implement tiered optimistic**
   - Add cascading veto threshold logic
   - Test complex veto scenarios

3. **Add tenant context**
   - Modify strategies to accept tenant information
   - Implement tenant-specific calculation rules

### Phase 3: Edge Cases (Week 3)
1. **Historical compatibility**
   - Add Optimism V6 upgrade logic
   - Handle pre/post upgrade vote ordering

2. **Budget calculations**
   - Implement budget change date logic
   - Add approval proposal budget tracking

3. **Error handling**
   - Add overflow protection
   - Improve division by zero handling

## Validation Strategy

### 1. Automated Testing
```typescript
// Run verification suite
npm run test -- --testNamePattern="Calculation Verification"

// Test specific proposal types  
npm run test -- --testNamePattern="Standard Proposals"
npm run test -- --testNamePattern="Optimistic Proposals"
npm run test -- --testNamePattern="Hybrid Proposals"
```

### 2. Data Comparison
```typescript
// Compare outputs for existing proposals
const proposals = await fetchRealProposalData();
for (const proposal of proposals) {
  await verifyCalculations(proposal);
}
```

### 3. Manual Verification
- Test each proposal type with known data
- Verify edge cases with extreme values
- Check historical proposals for compatibility

## Success Criteria

### 1. Calculation Accuracy
- ✅ All metrics match within 0.01% tolerance
- ✅ Status determinations match exactly
- ✅ Type-specific calculations are correct

### 2. Performance
- ✅ Calculation time ≤ existing implementation
- ✅ Memory usage within acceptable bounds
- ✅ No calculation errors or overflows

### 3. Maintainability  
- ✅ Each proposal type in separate strategy
- ✅ Easy to add new proposal types
- ✅ Clear separation of concerns

## Risk Mitigation

### 1. Gradual Rollout
- Start with read-only calculation comparison
- Feature flag controlled deployment
- Automatic fallback to old system on discrepancies

### 2. Monitoring
- Track calculation differences in production
- Alert on any discrepancies > 0.1%
- Monitor performance metrics

### 3. Rollback Plan
- Keep old calculation functions as fallback
- Feature flag can disable new system instantly
- Maintain parallel calculation during transition

## Next Steps

1. **Implement the fixes** from `implementation-fixes.md`
2. **Run the verification tests** from `calculation-verification.md`
3. **Iterate until all tests pass** with 100% accuracy
4. **Deploy with feature flags** for safe testing
5. **Gradually increase traffic** once verified

The complexity analysis shows that while the calculations are intricate, they can be accurately reproduced in the new architecture while maintaining much better code organization and maintainability.