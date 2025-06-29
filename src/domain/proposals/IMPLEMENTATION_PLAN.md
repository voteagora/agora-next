# Implementation Plan: Migrating to New Proposal Architecture

## Overview

This plan outlines a phased approach to migrate existing APIs and components to the new domain-driven proposal architecture while maintaining backward compatibility.

## Phase 1: Core API Migration (Week 1)

### 1.1 Proposal Fetching APIs

#### Target Files:

- `src/app/api/common/proposals/getProposals.ts`
- `src/app/api/common/proposals/getProposal.ts`
- `src/app/api/common/proposals/proposalsFilter.ts`

#### Implementation Steps:

```typescript
// Step 1: Update getProposals.ts
import { ProposalAdapter } from "@/domain/proposals/adapters/ProposalAdapter";
import { ProposalRepositoryFactory } from "@/infrastructure/database/ProposalRepositoryFactory";

export async function getProposals(
  tenant: string,
  daoSlug: DAOSlug,
  offset?: number,
  limit?: number,
  proposalType?: ProposalType,
  proposalStatus?: ProposalStage
) {
  // Initialize the system (do this once)
  ProposalAdapter.initialize();

  // Get votable supply
  const votableSupply = await getVotableSupplyForTenant(tenant);

  // Option A: Minimal change - use adapter
  const rawProposals = await fetchProposalsFromDB(/* existing params */);
  const domainProposals = ProposalAdapter.toDomainModels(
    rawProposals,
    votableSupply
  );

  // Apply filters and sorting using domain models
  const filteredProposals = domainProposals.filter((p) => {
    if (proposalType && p.getType() !== proposalType) return false;
    if (proposalStatus && p.getStatus() !== proposalStatus) return false;
    return true;
  });

  // Convert to API format
  return ProposalAdapter.toApiResponses(filteredProposals);
}
```

### 1.2 Proposal Details API

```typescript
// Update getProposal.ts
export async function getProposal(
  proposalId: string,
  tenant: string,
  daoSlug: DAOSlug
) {
  const repository = ProposalRepositoryFactory.getRepository(tenant);
  const proposal = await repository.findById(new ProposalId(proposalId));

  if (!proposal) {
    throw new ProposalNotFoundError(proposalId);
  }

  // Get additional data if needed
  const votes = await getProposalVotes(proposalId);

  const response = ProposalAdapter.toApiResponse(proposal);
  response.votes = votes;

  return response;
}
```

### 1.3 Create Feature Toggle

```typescript
// src/lib/featureFlags.ts
export const FEATURE_FLAGS = {
  USE_NEW_PROPOSAL_SYSTEM: process.env.USE_NEW_PROPOSAL_SYSTEM === "true",
};

// Usage in API
if (FEATURE_FLAGS.USE_NEW_PROPOSAL_SYSTEM) {
  return getProposalsNewSystem(params);
} else {
  return getProposalsOldSystem(params);
}
```

## Phase 2: Component Migration (Week 2)

### 2.1 Proposal List Components

#### Target Components:

- `src/components/Proposals/ProposalsList/ProposalsList.tsx`
- `src/components/Proposals/ProposalPage/ProposalPage.tsx`
- `src/components/Proposals/ProposalVotesCard.tsx`

#### Implementation:

```typescript
// Create a new hook for proposal data
// src/hooks/useProposal.ts
import { ProposalAdapter } from "@/domain/proposals/adapters/ProposalAdapter";

export function useProposal(proposalId: string) {
  const { data: rawProposal, ...rest } = useQuery({
    queryKey: ["proposal", proposalId],
    queryFn: () => fetchProposal(proposalId),
  });

  const proposal = useMemo(() => {
    if (!rawProposal) return null;
    return ProposalAdapter.toDomainModel(rawProposal, votableSupply);
  }, [rawProposal, votableSupply]);

  const apiFormat = useMemo(() => {
    if (!proposal) return null;
    return ProposalAdapter.toApiResponse(proposal);
  }, [proposal]);

  return {
    ...rest,
    proposal,
    data: apiFormat,
  };
}
```

### 2.2 Proposal Type Components

```typescript
// Update components to use type registry
// src/components/Proposals/ProposalTypeSelector.tsx
import { ProposalTypeRegistry } from "@/domain/proposals/factories/ProposalTypeRegistry";

export function ProposalTypeSelector({ selectedType, onSelect }) {
  const registry = ProposalTypeRegistry.getInstance();
  const allTypes = registry.getAllTypes();

  return (
    <Select value={selectedType} onValueChange={onSelect}>
      {allTypes.map(type => {
        const config = registry.getConfig(type);
        return (
          <SelectItem key={type} value={type}>
            {config.displayName}
          </SelectItem>
        );
      })}
    </Select>
  );
}
```

## Phase 3: Voting System Integration (Week 3)

### 3.1 Vote Casting

```typescript
// src/components/Votes/CastVoteDialog.tsx
export function CastVoteDialog({ proposal }) {
  const domainProposal = useMemo(() => {
    return ProposalAdapter.toDomainModel(proposal, votableSupply);
  }, [proposal]);

  const typeConfig = ProposalAdapter.getTypeConfig(domainProposal.getType());

  // Show appropriate UI based on features
  if (typeConfig.features.hasApprovalOptions) {
    return <ApprovalVoteDialog proposal={domainProposal} />;
  }

  if (typeConfig.features.hasOptimisticVeto) {
    return <OptimisticVoteDialog proposal={domainProposal} />;
  }

  return <StandardVoteDialog proposal={domainProposal} />;
}
```

### 3.2 Vote Display

```typescript
// src/components/Votes/VotesList.tsx
export function VotesList({ proposalId }) {
  const { proposal } = useProposal(proposalId);

  if (!proposal) return null;

  const metrics = proposal.getMetrics();
  const typeConfig = ProposalAdapter.getTypeConfig(proposal.getType());

  return (
    <div>
      <VoteMetrics metrics={metrics} />
      {typeConfig.features.hasApprovalOptions && (
        <ApprovalOptionsDisplay options={proposal.getData().options} />
      )}
      {/* ... other type-specific displays */}
    </div>
  );
}
```

## Phase 4: Proposal Creation (Week 4)

### 4.1 Proposal Draft System

```typescript
// src/components/Proposals/ProposalDraftForm.tsx
export function ProposalDraftForm({ type }) {
  const typeConfig = ProposalAdapter.getTypeConfig(type);
  const strategy = ProposalTypeRegistry.getInstance().getStrategy(type);

  const validateData = (data) => {
    try {
      const parsed = strategy.parseData(data);
      return strategy.validateData(parsed);
    } catch (error) {
      return false;
    }
  };

  // Render form based on type features
  return (
    <Form onSubmit={handleSubmit}>
      {typeConfig.features.hasApprovalOptions && (
        <ApprovalOptionsForm />
      )}
      {/* ... other type-specific forms */}
    </Form>
  );
}
```

## Phase 5: Advanced Features (Week 5)

### 5.1 Proposal Analytics

```typescript
// src/lib/analytics/proposalAnalytics.ts
export class ProposalAnalytics {
  static async getMetricsByType(tenant: TENANT_NAMESPACES) {
    const repository = ProposalRepositoryFactory.getRepository(tenant);
    const proposals = await repository.findMany({ limit: 1000 });

    const metricsByType = new Map();

    for (const proposal of proposals.items) {
      const type = proposal.getType();
      const metrics = proposal.getMetrics();

      if (!metricsByType.has(type)) {
        metricsByType.set(type, {
          count: 0,
          avgParticipation: 0,
          avgApproval: 0,
        });
      }

      const typeMetrics = metricsByType.get(type);
      typeMetrics.count++;
      typeMetrics.avgParticipation += metrics.participationRate;
      typeMetrics.avgApproval += metrics.approvalRate;
    }

    // Calculate averages
    for (const [type, metrics] of metricsByType) {
      metrics.avgParticipation /= metrics.count;
      metrics.avgApproval /= metrics.count;
    }

    return metricsByType;
  }
}
```

### 5.2 Proposal Search

```typescript
// src/lib/search/proposalSearch.ts
export class ProposalSearchService {
  static async search(
    tenant: TENANT_NAMESPACES,
    query: string,
    filters: SearchFilters
  ) {
    const repository = ProposalRepositoryFactory.getRepository(tenant);

    // Get all proposals (in production, use proper search index)
    const allProposals = await repository.findMany({ limit: 1000 });

    // Filter by search query
    const results = allProposals.items.filter((proposal) => {
      const searchText = [
        proposal.getTitle(),
        proposal.getDescription(),
        proposal.getProposer(),
      ]
        .join(" ")
        .toLowerCase();

      return searchText.includes(query.toLowerCase());
    });

    // Apply type filters
    if (filters.types?.length > 0) {
      return results.filter((p) => filters.types.includes(p.getType()));
    }

    return results;
  }
}
```

## Migration Checklist

### Week 1: Core APIs

- [ ] Update `getProposals.ts` to use ProposalAdapter
- [ ] Update `getProposal.ts` to use repository pattern
- [ ] Add feature flags for gradual rollout
- [ ] Update API response types
- [ ] Add error handling for new domain errors

### Week 2: Components

- [ ] Create `useProposal` and `useProposals` hooks
- [ ] Update ProposalsList component
- [ ] Update ProposalPage component
- [ ] Update proposal type selectors
- [ ] Migrate proposal status displays

### Week 3: Voting

- [ ] Update CastVoteDialog for type-specific voting
- [ ] Migrate vote display components
- [ ] Update voting power calculations
- [ ] Integrate with new metrics system

### Week 4: Creation

- [ ] Update proposal draft forms
- [ ] Add type-specific validation
- [ ] Update proposal submission flow
- [ ] Migrate proposal preview components

### Week 5: Advanced

- [ ] Implement analytics dashboard
- [ ] Add proposal search functionality
- [ ] Update notification system
- [ ] Performance optimization

## Testing Strategy

### Unit Tests

```typescript
// src/domain/proposals/__tests__/ProposalFactory.test.ts
describe("ProposalFactory", () => {
  it("should create standard proposal", () => {
    const payload = createStandardPayload();
    const proposal = factory.createProposal(payload);

    expect(proposal.getType()).toBe("STANDARD");
    expect(proposal.getMetrics().quorumMet).toBe(true);
  });
});
```

### Integration Tests

```typescript
// src/app/api/common/proposals/__tests__/getProposals.test.ts
describe("getProposals API", () => {
  it("should return proposals in new format", async () => {
    const result = await getProposals(TENANT_NAMESPACES.OPTIMISM);

    expect(result[0]).toHaveProperty("metrics");
    expect(result[0]).toHaveProperty("status");
  });
});
```

### E2E Tests

```typescript
// e2e/proposals.spec.ts
test("proposal lifecycle", async ({ page }) => {
  // Test full proposal flow with new system
  await page.goto("/proposals");
  await expect(page.locator(".proposal-card")).toBeVisible();
});
```

## Rollback Plan

If issues arise:

1. **Feature flags**: Disable `USE_NEW_PROPOSAL_SYSTEM`
2. **Adapter fallback**: ProposalAdapter can use old parsing logic
3. **Database unchanged**: No schema changes required
4. **Component fallback**: Keep old components available

## Success Metrics

- **Performance**: 50% reduction in API response time
- **Code quality**: 80% reduction in cyclomatic complexity
- **Maintainability**: New proposal types added in < 1 day
- **Testing**: 90% unit test coverage
- **Errors**: < 0.1% error rate in production

## Timeline

- **Week 1**: Core API migration (high priority)
- **Week 2**: Component migration (medium priority)
- **Week 3**: Voting system (medium priority)
- **Week 4**: Creation flow (low priority)
- **Week 5**: Advanced features (low priority)

## Next Steps

1. Start with `getProposals.ts` API migration
2. Set up feature flags
3. Create monitoring dashboard
4. Begin incremental rollout (5% → 25% → 50% → 100%)
5. Gather metrics and feedback
6. Complete remaining phases based on results
