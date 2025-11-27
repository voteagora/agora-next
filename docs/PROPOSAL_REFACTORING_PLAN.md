# Proposal System Refactoring Plan

> **Status:** ✅ Complete  
> **Created:** 2025-11-28  
> **Last Updated:** 2025-11-28

## Overview

Refactoring the proposal system to improve type safety, reduce code duplication, and create a cleaner architecture for handling proposals from multiple data sources.

---

## Current Issues

### 1. Type Assertions Problem

- **Location:** `StandardProposalRow.tsx:180`, `normalizeArchiveProposal.ts`, etc.
- **Issue:** `(proposal.outcome as EasOodaoVoteOutcome)` casts are needed because `ArchiveListProposal` is a large "bag of optional fields" union
- **Impact:** No compile-time guarantee that the right fields exist for a given source

### 2. Duplicated Logic

- **Files affected:**
  - `normalizeArchiveProposal.ts` (for list views)
  - `normalizeArchiveProposalDetail.ts` (for detail pages)
  - Row components (`StandardProposalRow.tsx`, etc.)
- **Impact:** Same extraction logic duplicated across files

### 3. Unclear Data Flow

- **Location:** `page.tsx`
- **Issue:** Handles both live API and archive data with different normalization paths
- **Impact:** Toggle checks scattered across render logic

---

## Data Sources

| Source      | Description                              | Fields                                                  |
| ----------- | ---------------------------------------- | ------------------------------------------------------- |
| `dao_node`  | Onchain proposals from governor contract | `totals`, `voting_module_name`, `decoded_proposal_data` |
| `eas-atlas` | EAS-based OP citizen voting              | `outcome` (USER/APP/CHAIN), `proposal_type`, `tiers`    |
| `eas-oodao` | EAS-based generic DAO proposals          | `outcome` (token-holders), `proposal_type` object       |
| `snapshot`  | Snapshot voting                          | Snapshot-specific fields                                |

---

## Proposal Types

```typescript
type ProposalType =
  | "STANDARD" // Simple for/against/abstain
  | "APPROVAL" // Multi-choice approval voting
  | "OPTIMISTIC" // Pass unless vetoed
  | "SNAPSHOT" // Snapshot voting
  | "OFFCHAIN_STANDARD"
  | "OFFCHAIN_APPROVAL"
  | "OFFCHAIN_OPTIMISTIC"
  | "OFFCHAIN_OPTIMISTIC_TIERED"
  | "HYBRID_STANDARD" // Onchain + offchain combined
  | "HYBRID_APPROVAL"
  | "HYBRID_OPTIMISTIC"
  | "HYBRID_OPTIMISTIC_TIERED";
```

---

## Implementation Phases

### Phase 1: Source-Discriminated Types

**Status:** ✅ Already Exists

The codebase already has source-discriminated types in `src/lib/types/archiveProposal.ts`:

- `DaoNodeProposal` - dao_node source
- `EasAtlasProposal` - eas-atlas source
- `EasOodaoProposal` - eas-oodao source
- `ArchiveProposalBySource` - discriminated union
- Type guards: `isDaoNodeProposal`, `isEasAtlasProposal`, `isEasOodaoProposal`, `isHybridProposal`

**Note:** The issue is that code still uses `ArchiveListProposal` (legacy "bag of fields" type) with type assertions.

---

### Phase 2: Unified Extraction Layer

**Status:** ✅ Complete

Created extractors that use type guards for safe field access:

```
src/lib/proposals/extractors/
├── index.ts                    # Re-exports all extractors
├── types.ts                    # VoteData, StandardMetrics, ApprovalMetrics, etc.
├── guards.ts                   # Type guards for safe field access
├── standard.ts                 # extractStandardMetrics(proposal, options)
├── approval.ts                 # extractApprovalMetrics(proposal, options)
└── optimistic.ts               # extractOptimisticMetrics, extractOptimisticTieredMetrics
```

**Tasks:**

- [x] Create `extractors/types.ts` with shared types
- [x] Create `extractors/guards.ts` with type guards
- [x] Create `extractors/standard.ts` with type-guarded logic
- [x] Create `extractors/approval.ts`
- [x] Create `extractors/optimistic.ts` (includes tiered)
- [x] Create `extractors/index.ts` to export all
- [x] Create unified `archiveToProposal()` function (`src/lib/proposals/normalizeArchive.ts`)
- [x] Update row components to use new extractors
  - `StandardProposalRow.tsx` ✓
  - `ApprovalProposalRow.tsx` ✓
  - `OptimisticProposalRow.tsx` ✓
  - `OptimisticTieredProposalRow.tsx` ✓

---

### Phase 3: Simplify Page.tsx

**Status:** ✅ Complete

Simplify the proposal detail page to use unified normalization:

**Before:**

```tsx
async function loadProposal(...) {
  if (useArchive) {
    if (archiveProposal && isArchiveStandardProposal(archiveProposal)) {
      return normalizeArchiveStandardProposal(archiveProposal, options);
    }
    // More type-specific handling...
  }
  return fetchLiveProposal(proposalId);
}
```

**After:**

```tsx
async function loadProposal(proposalId: string): Promise<Proposal> {
  const { namespace, token, ui } = Tenant.current();
  const useArchive = ui.toggle("use-archive-for-proposals")?.enabled;

  if (useArchive) {
    const raw = await fetchProposalFromArchive(namespace, proposalId);
    if (!raw) throw new Error("Proposal not found");
    return archiveToProposal(raw, { tokenDecimals: token.decimals ?? 18 });
  }

  return fetchProposal(proposalId);
}
```

**Tasks:**

- [x] Refactor `loadProposal` to use unified normalization
- [x] Remove type-specific normalization branches
- [x] Simplify component selection logic (moved to Phase 4)

---

### Phase 4: Proposal Page Component Registry

**Status:** ✅ Complete

Create a registry mapping proposal types to page components:

```tsx
// src/components/Proposals/ProposalPage/registry.ts
export const PROPOSAL_PAGE_COMPONENTS: Record<
  ProposalType,
  ComponentType<{ proposal: Proposal }>
> = {
  STANDARD: StandardProposalPage,
  HYBRID_STANDARD: HybridStandardProposalPage,
  OFFCHAIN_STANDARD: OffchainStandardProposalPage,
  APPROVAL: ApprovalProposalPage,
  HYBRID_APPROVAL: HybridApprovalProposalPage,
  OFFCHAIN_APPROVAL: OffchainApprovalProposalPage,
  OPTIMISTIC: OptimisticProposalPage,
  HYBRID_OPTIMISTIC: HybridOptimisticProposalPage,
  OFFCHAIN_OPTIMISTIC: OffchainOptimisticProposalPage,
  HYBRID_OPTIMISTIC_TIERED: HybridOptimisticTieredProposalPage,
  OFFCHAIN_OPTIMISTIC_TIERED: OffchainOptimisticTieredProposalPage,
  SNAPSHOT: SnapshotProposalPage,
};
```

**Tasks:**

- [x] Create `registry.ts` with component mapping
- [x] Add `getProposalPageComponent()` helper function
- [x] Add `requiresSpecialHandling()` for Copeland
- [x] Update `page.tsx` to use registry (replaced 50-line switch with 5 lines)

---

### Phase 5: Refactor Row Components

**Status:** ✅ Complete (done in Phase 2)

Updated `ArchiveProposalList` row components to use shared extractors.

**Tasks:**

- [x] Update `StandardProposalRow.tsx` to use extractors
- [x] Update `ApprovalProposalRow.tsx`
- [x] Update `OptimisticProposalRow.tsx`
- [x] Update `OptimisticTieredProposalRow.tsx`
- [ ] Update `SnapshotProposalRow.tsx` (if needed)
- [x] Remove internal extraction functions from row components

---

### Phase 6: Cleanup

**Status:** ✅ Complete

Removed deprecated files:

**Tasks:**

- [x] Remove `normalizeArchiveProposal.ts` (deleted)
- [x] Remove `normalizeArchiveProposalDetail.ts` (deleted)
- [x] Update imports across codebase
- [x] Keep `archiveProposalUtils.ts` (still used by other code)
- [ ] Add unit tests for extractors (optional, future work)

---

## Files Changed

### New Files Created

| File                                                | Purpose                       |
| --------------------------------------------------- | ----------------------------- |
| `src/lib/proposals/index.ts`                        | Main exports                  |
| `src/lib/proposals/normalizeArchive.ts`             | Unified `archiveToProposal()` |
| `src/lib/proposals/extractors/index.ts`             | Extractor exports             |
| `src/lib/proposals/extractors/types.ts`             | Shared types                  |
| `src/lib/proposals/extractors/guards.ts`            | Type guards                   |
| `src/lib/proposals/extractors/standard.ts`          | Standard vote extraction      |
| `src/lib/proposals/extractors/approval.ts`          | Approval vote extraction      |
| `src/lib/proposals/extractors/optimistic.ts`        | Optimistic vote extraction    |
| `src/components/Proposals/ProposalPage/registry.ts` | Component registry            |

### Files Modified

| File                                                                                    | Changes                                    |
| --------------------------------------------------------------------------------------- | ------------------------------------------ |
| `src/app/proposals/[proposal_id]/page.tsx`                                              | Use `archiveToProposal()` and registry     |
| `src/components/Proposals/Proposal/ArchiveProposalList/StandardProposalRow.tsx`         | Use shared extractors (~200 lines removed) |
| `src/components/Proposals/Proposal/ArchiveProposalList/ApprovalProposalRow.tsx`         | Use shared extractors (~130 lines removed) |
| `src/components/Proposals/Proposal/ArchiveProposalList/OptimisticProposalRow.tsx`       | Use shared extractors (~120 lines removed) |
| `src/components/Proposals/Proposal/ArchiveProposalList/OptimisticTieredProposalRow.tsx` | Use shared extractors (~90 lines removed)  |
| `src/components/Proposals/Proposal/ArchiveProposalList/ArchiveProposalRow.tsx`          | Simplified props                           |

### Files Deleted

| File                                                                          | Reason                            |
| ----------------------------------------------------------------------------- | --------------------------------- |
| `src/components/Proposals/Proposal/Archive/normalizeArchiveProposal.ts`       | Replaced by extractors            |
| `src/components/Proposals/Proposal/Archive/normalizeArchiveProposalDetail.ts` | Replaced by `archiveToProposal()` |

---

## Benefits

1. **Type Safety:** Type guards eliminate `as` casts
2. **Single Source of Truth:** One normalization function for both list and details
3. **Modularity:** Extractors are testable and reusable
4. **Clarity:** Clear mapping from source → extractor → Proposal
5. **Maintainability:** Adding a new source or proposal type is straightforward

---

## Notes

- Existing type guards in `archiveProposal.ts` (`isDaoNodeProposal`, `isEasAtlasProposal`, etc.) will be preserved and moved to `guards.ts`
- The `deriveProposalType` function already exists and handles most type derivation logic
- Consider adding unit tests for each extractor function
