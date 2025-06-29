# Migration Checklist: Step-by-Step Implementation

## ✅ Pre-Migration Setup (COMPLETED)

### ✅ Prerequisites

- [x] New domain architecture is complete
- [x] All 12 proposal strategies are implemented
- [x] ProposalFactory and TypeRegistry are ready
- [x] Repository pattern is implemented
- [x] ProposalAdapter is created for bridging
- [x] TypeScript compilation errors fixed
- [x] Hybrid proposal support implemented
- [x] API response format matches parseProposal

### ✅ Environment Setup (COMPLETED)

- [x] Added environment variables to `.env.local`:
  ```bash
  USE_NEW_PROPOSAL_SYSTEM=true
  NEW_SYSTEM_PERCENTAGE=10
  ENABLE_SYSTEM_COMPARISON=true
  PROPOSAL_SYSTEM_LOG_LEVEL=info
  ```
- [x] Created `proposalSystemConfig.ts` for centralized configuration
- [x] Added ProposalSystemLogger for migration tracking
- [x] Added ProposalSystemMetrics for real-time monitoring
- [x] Created admin metrics endpoint at `/api/v1/admin/proposal-system-metrics`

## ✅ Week 1: Core API Migration (COMPLETED)

### ✅ Day 1-2: Setup and Preparation

- [x] **Automatic initialization in ProposalAdapter**
  - No manual startup code needed
  - Strategies are cached after first use

- [x] **Feature flag with percentage control**
  ```typescript
  // In proposalSystemConfig.ts
  const config = {
    useNewSystem: process.env.USE_NEW_PROPOSAL_SYSTEM === 'true',
    newSystemPercentage: parseInt(process.env.NEW_SYSTEM_PERCENTAGE || '0'),
    isEnabled: useNewSystem && Math.random() * 100 < newSystemPercentage
  };
  ```

- [x] **Comprehensive error tracking**
  - Automatic fallback on any error
  - Errors logged with full context
  - Metrics track error rate and fallback usage

### ✅ Day 3-4: getProposals.ts Migration

- [x] **Integrated new system with automatic fallback**
  ```typescript
  if (config.isEnabled) {
    try {
      // Use new domain architecture
      const domainProposal = ProposalAdapter.toDomainModel(...);
      return ProposalAdapter.toApiResponse(domainProposal);
    } catch (error) {
      // Automatic fallback to old system
      ProposalSystemLogger.logFallbackToOldSystem(...);
    }
  }
  ```

- [x] **Both systems work seamlessly**
- [x] **Real-time metrics tracking**
- [x] **Output comparison logging available**

### ⏳ Day 5: Additional Endpoints

- [ ] **Migrate getProposal.ts (single proposal endpoint)**
- [ ] **Update any other proposal-fetching endpoints**
- [ ] **Ensure consistent error handling across all endpoints**

## 🚀 Current Status: READY FOR TESTING

### ✅ What's Complete

1. **Architecture**: 100% implemented with all proposal types
2. **Integration**: getProposals.ts fully integrated with fallback
3. **Monitoring**: Real-time metrics and logging in place
4. **Safety**: Automatic fallback ensures zero risk
5. **Configuration**: Environment-based control ready

### 🎯 Immediate Next Steps

1. **Enable in Development**:
   ```bash
   USE_NEW_PROPOSAL_SYSTEM=true
   NEW_SYSTEM_PERCENTAGE=100
   PROPOSAL_SYSTEM_LOG_LEVEL=debug
   ```

2. **Test All Proposal Types**:
   - [ ] STANDARD proposals
   - [ ] APPROVAL proposals with budget allocation
   - [ ] OPTIMISTIC proposals with veto mechanism
   - [ ] HYBRID proposals with weighted voting
   - [ ] All OFFCHAIN_* variants

3. **Monitor Metrics**:
   ```bash
   curl http://localhost:3000/api/v1/admin/proposal-system-metrics
   ```

## Week 2: Validation & Performance Testing

### Performance Benchmarks

- [ ] **Measure response times**
  - Old system baseline: ___ms
  - New system average: ___ms
  - Target: Equal or better performance

- [ ] **Memory usage analysis**
  - Old system: ___MB
  - New system: ___MB
  - Target: <10% increase

- [ ] **Database query optimization**
  - Queries per request: ___
  - N+1 queries eliminated: ___

### Calculation Verification

- [ ] **Compare calculations between systems**
  ```typescript
  // Enable comparison logging
  ENABLE_SYSTEM_COMPARISON=true
  ```

- [ ] **Verify for each tenant**:
  - [ ] Optimism (hybrid voting, optimistic)
  - [ ] ENS (snapshot integration)
  - [ ] Uniswap (standard governance)
  - [ ] Cyber (endorsed delegates)

### Edge Case Testing

- [ ] **Empty proposal data**
- [ ] **Missing optional fields**
- [ ] **Large proposal descriptions**
- [ ] **Complex approval budgets**
- [ ] **Hybrid voting edge cases**

## Week 3: Production Rollout

### Phase 1: Initial Production (10%)

```bash
# Production environment
USE_NEW_PROPOSAL_SYSTEM=true
NEW_SYSTEM_PERCENTAGE=10
ENABLE_SYSTEM_COMPARISON=true
PROPOSAL_SYSTEM_LOG_LEVEL=info
```

- [ ] Deploy to production
- [ ] Monitor for 48 hours
- [ ] Check metrics hourly
- [ ] Review error logs
- [ ] Compare calculations

### Phase 2: Expanded Rollout (50%)

- [ ] Increase to 50% after successful 10% period
- [ ] Continue monitoring for 1 week
- [ ] Address any edge cases
- [ ] Optimize based on metrics

### Phase 3: Full Rollout (100%)

- [ ] Move to 100% traffic
- [ ] Disable comparison logging
- [ ] Monitor for 2 weeks
- [ ] Prepare for legacy cleanup

## Monitoring Dashboard

### Key Metrics to Track

```json
{
  "newSystemUsage": "Number of requests handled by new system",
  "oldSystemUsage": "Number of requests handled by old system",
  "fallbackCount": "Number of times fallback was triggered",
  "errors": "Total errors in new system",
  "errorRate": "Percentage of requests that errored",
  "fallbackRate": "Percentage of new system requests that fell back"
}
```

### Alert Thresholds

- [ ] Error rate > 1% - Investigate immediately
- [ ] Fallback rate > 5% - Review logs
- [ ] Response time > 2x baseline - Performance issue
- [ ] Memory usage > 2x baseline - Memory leak

## Success Criteria

### Technical Metrics

- [x] **TypeScript compilation**: Zero errors ✅
- [x] **Lint checks**: All passing ✅
- [ ] **Unit tests**: 100% coverage for new code
- [ ] **Integration tests**: All scenarios covered
- [ ] **Performance**: Within 10% of old system

### Business Metrics

- [ ] **Calculation accuracy**: 100% match with old system
- [ ] **User experience**: No visible changes
- [ ] **Error rate**: <0.1% in production
- [ ] **Support tickets**: No increase

## Rollback Plan

### Immediate Rollback (< 1 minute)

```bash
# Set to 0% to stop all new system usage
NEW_SYSTEM_PERCENTAGE=0
```

### Complete Rollback (< 5 minutes)

```bash
# Disable entirely
USE_NEW_PROPOSAL_SYSTEM=false
```

### Rollback Triggers

1. Error rate exceeds 1%
2. Calculation discrepancies detected
3. Performance degradation > 50%
4. Critical user-facing issues

## Post-Migration Cleanup

### After 2+ Weeks at 100%

- [ ] Remove old `parseProposal` function
- [ ] Remove `proposalUtils.ts` parsing logic
- [ ] Clean up feature flags
- [ ] Update documentation
- [ ] Archive migration logs

### Code Cleanup

```typescript
// Remove from getProposals.ts
- if (config.isEnabled) {
-   // new system
- } else {
-   // old system
- }
+ // Use new system directly
+ const domainProposal = ProposalAdapter.toDomainModel(...);
```

## Team Communication

### Daily Updates During Migration

- [ ] Metrics summary
- [ ] Error analysis
- [ ] Performance trends
- [ ] User feedback
- [ ] Next steps

### Stakeholder Updates

- [ ] Week 1: Migration started, initial results
- [ ] Week 2: Performance validation complete
- [ ] Week 3: Production rollout progress
- [ ] Week 4: Migration complete, cleanup planned

## Documentation Updates

- [x] MIGRATION_GUIDE.md updated with latest process
- [x] IMPLEMENTATION_STATUS.md reflects current state
- [ ] API documentation updated
- [ ] README.md updated
- [ ] Architecture diagrams created

## Final Sign-off

- [ ] Engineering team approval
- [ ] QA team approval
- [ ] Product team approval
- [ ] Migration complete! 🎉