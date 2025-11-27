# Proposal System Component Architecture

> **Last Updated:** 2025-11-28

## Overview

This document describes how the proposal system components are organized, the data flow from archive sources to rendered components, and how different proposal types are handled in both list and detail views.

---

## Data Sources

The proposal system supports multiple data sources, each with different data structures:

| Source      | Description                              | Key Fields                                           |
| ----------- | ---------------------------------------- | ---------------------------------------------------- |
| `dao_node`  | Onchain proposals from governor contract | `totals` (vote counts), `voting_module_name`         |
| `eas-atlas` | EAS-based OP citizen voting (Atlas)      | `outcome` (USER/APP/CHAIN), `proposal_type`, `tiers` |
| `eas-oodao` | EAS-based generic DAO proposals          | `outcome` (token-holders), `proposal_type` object    |
| `snapshot`  | Snapshot voting                          | Snapshot-specific fields                             |

---

## Proposal Types

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

### Type Derivation

Proposal types are derived from raw archive data using `deriveProposalType()` in `src/lib/types/archiveProposal.ts`:

- Checks `voting_module_name` for dao_node source
- Checks `proposal_type` field for EAS sources
- Detects hybrid proposals via `hybrid: true` + `govless_proposal` presence

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Data Layer                                     │
├─────────────────────────────────────────────────────────────────────────┤
│  Archive NDJSON → fetchProposalFromArchive() → ArchiveListProposal      │
│                                                                          │
│  Types: src/lib/types/archiveProposal.ts                                │
│    - ArchiveListProposal (legacy bag-of-fields)                         │
│    - DaoNodeProposal, EasAtlasProposal, EasOodaoProposal (discriminated)│
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        Extraction Layer                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  src/lib/proposals/extractors/                                           │
│    ├── guards.ts      → Type guards for safe field access                │
│    ├── standard.ts    → extractStandardMetrics()                         │
│    ├── approval.ts    → extractApprovalMetrics()                         │
│    └── optimistic.ts  → extractOptimisticMetrics(), extractOptimistic-  │
│                         TieredMetrics()                                  │
│                                                                          │
│  Returns: StandardMetrics, ApprovalMetrics, OptimisticMetrics, etc.     │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                       Normalization Layer                                │
├─────────────────────────────────────────────────────────────────────────┤
│  src/lib/proposals/normalizeArchive.ts                                   │
│    archiveToProposal(raw, options) → Proposal                           │
│                                                                          │
│  Transforms raw archive data into normalized Proposal type for          │
│  consumption by both list and detail views.                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         Component Layer                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  LIST VIEW                        │  DETAIL VIEW                         │
│  ArchiveProposalList/             │  ProposalPage/                       │
│    ├── ArchiveProposalRow.tsx     │    ├── registry.ts                  │
│    ├── StandardProposalRow.tsx    │    │    ├── StandardProposalPage    │
│    ├── ApprovalProposalRow.tsx    │    │    ├── ArchiveStandardProposal-│
│    ├── OptimisticProposalRow.tsx  │    │    │   Page                    │
│    ├── OptimisticTieredProposal-  │    │    ├── HybridStandardProposal- │
│    │   Row.tsx                    │    │    │   Page                    │
│    └── SnapshotProposalRow.tsx    │    │    ├── HybridOptimisticProposal│
│                                   │    │    │   Page                    │
│                                   │    │    └── OPProposalOptimisticPage│
│                                   │    ├── OPProposalApprovalPage/      │
│                                   │    │    ├── OPProposalApprovalPage  │
│                                   │    │    └── HybridApprovalProposal- │
│                                   │    │        Page                    │
│                                   │    └── CopelandProposalPage/        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## List View Components

### File Structure

```
src/components/Proposals/Proposal/ArchiveProposalList/
├── index.ts                           # Exports
├── types.ts                           # ArchiveRowProps type
├── utils.ts                           # extractDisplayData helper
├── BaseRowLayout.tsx                  # Shared row layout
├── ArchiveProposalRow.tsx             # Router component
├── StandardProposalRow.tsx            # STANDARD, HYBRID_STANDARD, OFFCHAIN_STANDARD
├── ApprovalProposalRow.tsx            # APPROVAL, HYBRID_APPROVAL, OFFCHAIN_APPROVAL
├── OptimisticProposalRow.tsx          # OPTIMISTIC, HYBRID_OPTIMISTIC, OFFCHAIN_OPTIMISTIC
├── OptimisticTieredProposalRow.tsx    # HYBRID_OPTIMISTIC_TIERED, OFFCHAIN_OPTIMISTIC_TIERED
├── SnapshotProposalRow.tsx            # SNAPSHOT
├── OPApprovalArchiveStatusView.tsx    # Approval voting bar
├── OPOptimisticArchiveStatusView.tsx  # Optimistic progress bar
└── OPOptimisticTieredArchiveStatusView.tsx  # Tiered optimistic view
```

### How ArchiveProposalRow Works

`ArchiveProposalRow.tsx` is a **router component** that:

1. Derives the proposal type using `deriveProposalType(proposal)`
2. Routes to the appropriate row component based on type

```tsx
// ArchiveProposalRow.tsx
export function ArchiveProposalRow({
  proposal,
  tokenDecimals,
}: ArchiveRowProps) {
  const proposalType = deriveProposalType(proposal);

  switch (proposalType) {
    case "SNAPSHOT":
      return <SnapshotProposalRow proposal={proposal} />;

    case "STANDARD":
    case "HYBRID_STANDARD":
    case "OFFCHAIN_STANDARD":
      return (
        <StandardProposalRow
          proposal={proposal}
          tokenDecimals={tokenDecimals}
          proposalType={proposalType}
        />
      );

    case "APPROVAL":
    case "HYBRID_APPROVAL":
    case "OFFCHAIN_APPROVAL":
      return (
        <ApprovalProposalRow
          proposal={proposal}
          tokenDecimals={tokenDecimals}
        />
      );

    case "OPTIMISTIC":
    case "HYBRID_OPTIMISTIC":
    case "OFFCHAIN_OPTIMISTIC":
      return (
        <OptimisticProposalRow
          proposal={proposal}
          tokenDecimals={tokenDecimals}
        />
      );

    case "HYBRID_OPTIMISTIC_TIERED":
    case "OFFCHAIN_OPTIMISTIC_TIERED":
      return (
        <OptimisticTieredProposalRow
          proposal={proposal}
          tokenDecimals={tokenDecimals}
        />
      );

    default:
      return <UnsupportedProposalRow proposal={proposal} />;
  }
}
```

### Row Component Pattern

Each row component follows the same pattern:

1. **Extract metrics** using the shared extractor functions
2. **Build display data** using `extractDisplayData()` helper
3. **Render with BaseRowLayout** + type-specific status view

```tsx
// StandardProposalRow.tsx
export function StandardProposalRow({ proposal, tokenDecimals, proposalType = "STANDARD" }: ArchiveRowProps) {
  const decimals = tokenDecimals ?? 18;
  const isHybrid = proposalType === "HYBRID_STANDARD" || !!proposal.hybrid;

  const { displayData, metrics } = useMemo(() => {
    const displayData = extractDisplayData(proposal, proposalType, decimals);
    const metrics = extractStandardMetrics(proposal, { tokenDecimals: decimals });
    return { displayData, metrics };
  }, [proposal, decimals, proposalType]);

  // Hybrid proposals show percentage bars, non-hybrid show raw vote counts
  const metricsContent = isHybrid
    ? <HybridStandardStatusView forPercentage={...} againstPercentage={...} />
    : <OPStandardStatusView forAmount={metrics.forRaw} againstAmount={metrics.againstRaw} />;

  return <BaseRowLayout data={displayData} metricsContent={metricsContent} />;
}
```

---

## Detail View Components

### Component Registry

The detail page uses a registry pattern to select the right component:

```tsx
// src/components/Proposals/ProposalPage/registry.ts

// Main registry - maps proposal types to page components
export const PROPOSAL_PAGE_REGISTRY: Partial<
  Record<ProposalType, ProposalPageComponent>
> = {
  STANDARD: StandardProposalPage,
  HYBRID_STANDARD: HybridStandardProposalPage,
  OFFCHAIN_STANDARD: HybridStandardProposalPage,

  APPROVAL: OPProposalApprovalPage,
  HYBRID_APPROVAL: HybridApprovalProposalPage,
  OFFCHAIN_APPROVAL: HybridApprovalProposalPage,

  OPTIMISTIC: OPProposalOptimisticPage,
  HYBRID_OPTIMISTIC: HybridOptimisticProposalPage,
  OFFCHAIN_OPTIMISTIC: HybridOptimisticProposalPage,
  HYBRID_OPTIMISTIC_TIERED: HybridOptimisticProposalPage,
  OFFCHAIN_OPTIMISTIC_TIERED: HybridOptimisticProposalPage,

  SNAPSHOT: StandardProposalPage,
};

// Archive-specific registry (when archive mode enabled)
export const ARCHIVE_PROPOSAL_PAGE_REGISTRY: Partial<
  Record<ProposalType, ProposalPageComponent>
> = {
  STANDARD: ArchiveStandardProposalPage,
  // Add more as needed
};

// Helper to get the right component
export function getProposalPageComponent(
  proposalType: ProposalType,
  useArchive = false
): ProposalPageComponent {
  if (useArchive && ARCHIVE_PROPOSAL_PAGE_REGISTRY[proposalType]) {
    return ARCHIVE_PROPOSAL_PAGE_REGISTRY[proposalType]!;
  }
  return PROPOSAL_PAGE_REGISTRY[proposalType] ?? StandardProposalPage;
}

// Special handling for Copeland proposals
export function requiresSpecialHandling(
  proposal: Proposal
): ProposalPageComponent | null {
  if (proposal.proposalType === "SNAPSHOT") {
    const proposalData = proposal.proposalData as { type?: string };
    if (proposalData?.type === "copeland") {
      return CopelandProposalPage;
    }
  }
  return null;
}
```

### Detail Page Flow

```tsx
// src/app/proposals/[proposal_id]/page.tsx

async function loadProposal(
  proposalId: string,
  fetchLiveProposal
): Promise<Proposal> {
  const { namespace, token, ui } = Tenant.current();
  const useArchive = ui.toggle("use-archive-for-proposal-details")?.enabled;

  if (useArchive) {
    const archiveProposal = await fetchProposalFromArchive(
      namespace,
      proposalId
    );
    if (archiveProposal) {
      return archiveToProposal(archiveProposal, {
        namespace,
        tokenDecimals: token.decimals ?? 18,
      });
    }
    throw new Error("Proposal not found in archive");
  }

  return await fetchLiveProposal(proposalId);
}

export default async function Page({ params: { proposal_id } }) {
  const loadedProposal = await loadProposal(proposal_id, fetchProposal);

  const { ui } = Tenant.current();
  const useArchiveForProposals = ui.toggle(
    "use-archive-for-proposal-details"
  )?.enabled;

  // Check for special handling (e.g., Copeland)
  const specialComponent = requiresSpecialHandling(loadedProposal);
  const RenderComponent =
    specialComponent ||
    getProposalPageComponent(
      loadedProposal.proposalType ?? "STANDARD",
      useArchiveForProposals
    );

  return (
    <div className="flex justify-between mt-12">
      <div>
        <RenderComponent proposal={loadedProposal} />
      </div>
    </div>
  );
}
```

### Detail Page Components

| Component                      | Used For                           | Key Features                      |
| ------------------------------ | ---------------------------------- | --------------------------------- |
| `StandardProposalPage`         | STANDARD (live API)                | `ProposalVotesCard`, live voting  |
| `ArchiveStandardProposalPage`  | STANDARD (archive mode)            | `ArchiveProposalVotesCard`        |
| `HybridStandardProposalPage`   | HYBRID_STANDARD, OFFCHAIN_STANDARD | `HybridStandardProposalVotesCard` |
| `OPProposalApprovalPage`       | APPROVAL                           | Multi-option voting               |
| `HybridApprovalProposalPage`   | HYBRID_APPROVAL, OFFCHAIN_APPROVAL | Hybrid approval voting            |
| `OPProposalOptimisticPage`     | OPTIMISTIC                         | Disapproval threshold             |
| `HybridOptimisticProposalPage` | All hybrid/offchain optimistic     | Tiered thresholds                 |
| `CopelandProposalPage`         | SNAPSHOT (Copeland type)           | Ranked choice visualization       |

---

## Vote Extractors

The extraction layer provides type-safe vote metric extraction:

### File Structure

```
src/lib/proposals/extractors/
├── index.ts       # Re-exports everything
├── types.ts       # VoteData, StandardMetrics, ApprovalMetrics, etc.
├── guards.ts      # Type guards (isDaoNodeSource, isHybridProposal, etc.)
├── standard.ts    # extractStandardMetrics()
├── approval.ts    # extractApprovalMetrics()
└── optimistic.ts  # extractOptimisticMetrics(), extractOptimisticTieredMetrics()
```

### Type Guards

```typescript
// guards.ts - Check data source
isDaoNodeSource(proposal); // proposal.data_eng_properties.source === "dao_node"
isEasAtlasSource(proposal); // proposal.data_eng_properties.source === "eas-atlas"
isEasOodaoSource(proposal); // proposal.data_eng_properties.source === "eas-oodao"

// Check proposal structure
isHybridProposal(proposal); // proposal.hybrid === true && govless_proposal exists
hasDaoNodeTotals(proposal); // has totals["no-param"]
hasEasAtlasOutcome(proposal); // has outcome.USER/APP/CHAIN
hasEasOodaoOutcome(proposal); // has outcome["token-holders"]
```

### Extractor Usage

```typescript
import {
  extractStandardMetrics,
  extractApprovalMetrics,
  extractOptimisticMetrics,
  extractOptimisticTieredMetrics,
} from "@/lib/proposals/extractors";

// Standard voting metrics
const metrics = extractStandardMetrics(proposal, { tokenDecimals: 18 });
// Returns: { forVotes, againstVotes, abstainVotes, forRaw, againstRaw, abstainRaw, segments, hasVotes }

// Approval voting metrics
const approvalMetrics = extractApprovalMetrics(proposal, { tokenDecimals: 18 });
// Returns: { choices, maxApprovals, criteriaValue, totalVoters }

// Optimistic metrics
const optimisticMetrics = extractOptimisticMetrics(proposal, {
  tokenDecimals: 18,
});
// Returns: { againstCount, againstPercentage, defeatThreshold, isDefeated }

// Optimistic tiered metrics
const tieredMetrics = extractOptimisticTieredMetrics(proposal, {
  tokenDecimals: 18,
});
// Returns: { againstCount, supportCount, againstPercentage, tiers, currentTier, isDefeated }
```

---

## Normalization Layer

The `archiveToProposal()` function in `src/lib/proposals/normalizeArchive.ts` transforms raw archive data into the normalized `Proposal` type:

```typescript
import { archiveToProposal } from "@/lib/proposals";

const proposal = archiveToProposal(archiveProposal, {
  namespace: "optimism",
  tokenDecimals: 18,
});
```

### What It Does

1. **Base normalization** - Extracts common fields (id, title, proposer, timestamps, etc.)
2. **Type derivation** - Uses `deriveProposalType()` to determine proposal type
3. **Type-specific normalization** - Routes to appropriate normalizer:
   - `normalizeStandardProposal()` - for STANDARD, HYBRID_STANDARD, OFFCHAIN_STANDARD
   - `normalizeApprovalProposal()` - for APPROVAL variants
   - `normalizeOptimisticProposal()` - for OPTIMISTIC variants
   - `normalizeOptimisticTieredProposal()` - for tiered variants
4. **Archive metadata** - Attaches source info, tags, proposal type name

---

## Feature Toggles

The system uses feature toggles to control archive vs live data:

| Toggle                             | Effect                                          |
| ---------------------------------- | ----------------------------------------------- |
| `use-archive-for-proposal-details` | Detail page loads from archive instead of API   |
| `use-archive`                      | List page loads from archive (in ProposalsHome) |

Toggle checked in:

- `src/app/proposals/[proposal_id]/page.tsx` - Detail view
- `src/components/Proposals/ProposalsHome.tsx` - List view

---

## Key Files Reference

| File                                                     | Purpose                                           |
| -------------------------------------------------------- | ------------------------------------------------- |
| `src/lib/types/archiveProposal.ts`                       | Archive proposal types and `deriveProposalType()` |
| `src/lib/proposals/index.ts`                             | Main exports for proposal utilities               |
| `src/lib/proposals/normalizeArchive.ts`                  | `archiveToProposal()` normalization               |
| `src/lib/proposals/extractors/`                          | Vote metric extractors                            |
| `src/components/Proposals/ProposalPage/registry.ts`      | Component registry                                |
| `src/app/proposals/[proposal_id]/page.tsx`               | Detail page                                       |
| `src/components/Proposals/Proposal/ArchiveProposalList/` | List row components                               |

---

## Adding a New Proposal Type

1. **Add type** to `ProposalType` in `src/lib/types/index.ts`
2. **Update derivation** in `deriveProposalType()` in `archiveProposal.ts`
3. **Add extractor** if needed in `src/lib/proposals/extractors/`
4. **Add normalizer** in `normalizeArchive.ts`
5. **Add row component** in `ArchiveProposalList/`
6. **Add detail component** in `ProposalPage/`
7. **Register** in `registry.ts`
