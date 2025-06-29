# Migration Guide: Proposal System Refactoring

## Overview

This guide explains how to migrate from the existing proposal system to the new domain-driven architecture.

## 🚨 Critical Updates (December 2024)

### Environment Configuration

The migration is now controlled by environment variables for safe, gradual rollout:

```bash
# In .env.local

# Enable the new domain-driven proposal architecture
USE_NEW_PROPOSAL_SYSTEM=true

# Percentage of traffic to route to new system (0-100)
NEW_SYSTEM_PERCENTAGE=10

# Enable comparison logging between old and new systems
ENABLE_SYSTEM_COMPARISON=true

# Log level for proposal system debugging (error, warn, info, debug)
PROPOSAL_SYSTEM_LOG_LEVEL=info
```

### Gradual Rollout Strategy

1. **Testing Phase** (0% traffic):
   ```bash
   USE_NEW_PROPOSAL_SYSTEM=true
   NEW_SYSTEM_PERCENTAGE=0
   ENABLE_SYSTEM_COMPARISON=true
   PROPOSAL_SYSTEM_LOG_LEVEL=debug
   ```

2. **Initial Rollout** (10% traffic):
   ```bash
   NEW_SYSTEM_PERCENTAGE=10
   ```

3. **Expanded Rollout** (50% traffic):
   ```bash
   NEW_SYSTEM_PERCENTAGE=50
   ```

4. **Full Rollout** (100% traffic):
   ```bash
   NEW_SYSTEM_PERCENTAGE=100
   ENABLE_SYSTEM_COMPARISON=false
   ```

## Key Architecture Changes

### 1. Strategy-Based Proposal Parsing

**Before:**
```typescript
// In proposalUtils.ts - monolithic parsing function
export function parseProposal(proposal: any): ParsedProposal {
  // 400+ lines of conditional logic
  switch (proposal.proposal_type) {
    case "STANDARD":
    // parse standard...
    case "APPROVAL":
    // parse approval...
    // ... 12 more cases
  }
}
```

**After:**
```typescript
// Each proposal type has its own strategy
const proposal = ProposalAdapter.toDomainModel(
  rawProposal,
  votableSupply,
  context,
  offlineProposal // Automatically handles hybrid proposals
);
```

### 2. Automatic Hybrid Proposal Support

**Before:**
```typescript
// Manual checking for hybrid proposals
if (offlineProposal) {
  proposalType = mapOffchainProposalType(proposalType);
  // Complex manual data combination
}
```

**After:**
```typescript
// Automatic detection and combination
const proposal = ProposalAdapter.toDomainModel(
  onchainProposal,
  votableSupply,
  context,
  offlineProposal // Automatically creates HYBRID_* type
);
```

### 3. Type-Safe Proposal Handling

**Before:**
```typescript
// Scattered type checking
if (proposalType === "STANDARD" || proposalType === "OFFCHAIN_STANDARD") {
  // handle standard types
}
```

**After:**
```typescript
const config = ProposalTypeRegistry.getInstance().getConfig(proposalType);
if (config.features.hasApprovalOptions) {
  // Type-safe feature checking
}
```

## Migration Implementation

### Step 1: Update API Endpoints

The system has been integrated into `getProposals.ts` with automatic fallback:

```typescript
import { ProposalAdapter } from '@/domain/proposals/adapters/ProposalAdapter';
import { getProposalSystemConfig } from '@/lib/config/proposalSystemConfig';

// The new system is automatically used based on configuration
const config = getProposalSystemConfig();

if (config.isEnabled) {
  try {
    // New domain architecture
    const domainProposal = ProposalAdapter.toDomainModel(
      proposal,
      votableSupply,
      {
        tenant: namespace,
        calculationOptions: proposal.calculation_options,
        delegateQuorum: quorum ? BigInt(quorum) : undefined,
        disapprovalThreshold: proposal.disapproval_threshold,
        budgetChangeDate: proposal.budget_change_date,
      },
      offlineProposal // For hybrid proposals
    );
    
    return ProposalAdapter.toApiResponse(domainProposal);
  } catch (error) {
    // Automatic fallback to old system
    // Error is logged and tracked in metrics
  }
}
```

### Step 2: Monitor Migration Progress

Access real-time metrics at:
```
GET /api/v1/admin/proposal-system-metrics
```

Response:
```json
{
  "timestamp": "2024-12-28T14:30:00.000Z",
  "config": {
    "useNewSystem": true,
    "newSystemPercentage": 10
  },
  "metrics": {
    "newSystemUsage": 45,
    "oldSystemUsage": 405,
    "fallbackCount": 2,
    "errors": 1,
    "errorRate": 0.22,
    "fallbackRate": 4.44
  }
}
```

### Step 3: Update Component Usage

For React components using proposals:

```typescript
// Before
const proposal = parseProposal(rawData);

// After - Use the API response directly
// The API already returns the correct format
const { data: proposal } = useProposal(proposalId);
```

## Key Benefits

### 1. **Zero-Risk Migration**
- Automatic fallback on any error
- Percentage-based traffic control
- Real-time monitoring

### 2. **Improved Maintainability**
- Each proposal type in its own strategy
- Clear separation of concerns
- Type-safe throughout

### 3. **Enhanced Features**
- Automatic hybrid proposal handling
- Consistent calculation logic
- Better error messages

### 4. **Performance**
- Strategies are cached after initialization
- Optimized calculation paths
- Reduced code complexity

## Common Migration Scenarios

### Adding a New Proposal Type

**Before:** Modify multiple files, add cases to switch statements

**After:**
```typescript
// 1. Create new strategy
export class NewProposalStrategy extends BaseProposalStrategy {
  // Implement required methods
}

// 2. Register in initializer
registry.register({
  type: "NEW_TYPE",
  strategy: new NewProposalStrategy(),
  displayName: "New Proposal Type",
  features: { /* ... */ }
});
```

### Modifying Calculations

**Before:** Find and update logic scattered across utils

**After:** Update the specific strategy:
```typescript
// In specific strategy file
calculateMetrics(proposal: Proposal): ProposalMetrics {
  // Centralized calculation logic
}
```

### Debugging Issues

**Before:** Trace through monolithic functions

**After:** 
1. Check metrics endpoint for error rates
2. Enable debug logging: `PROPOSAL_SYSTEM_LOG_LEVEL=debug`
3. Check specific strategy implementation

## Rollback Plan

If issues arise at any point:

1. **Immediate:** Set `NEW_SYSTEM_PERCENTAGE=0`
2. **Complete:** Set `USE_NEW_PROPOSAL_SYSTEM=false`
3. All traffic instantly reverts to old system
4. Fix issues and retry migration

## Next Steps

1. **Monitor** the metrics endpoint regularly
2. **Gradually increase** traffic percentage
3. **Watch for** any calculation discrepancies
4. **Remove old system** after 2+ weeks at 100%

## Support

- Check logs for `[ProposalSystem]` entries
- Use metrics endpoint for real-time status
- All errors include context for debugging
- System comparison logs show any discrepancies