# Proposal Refactor Checklist

This checklist tracks the proposal-domain reorganization toward a single
canonical taxonomy and feature-oriented structure.

## Phase 1: Canonical Taxonomy

- [x] Add `src/features/proposals/domain/taxonomy.ts`
- [x] Add `src/features/proposals/domain/model.ts`
- [x] Add `src/features/proposals/domain/index.ts`
- [x] Re-anchor runtime `ProposalType` exports in [src/lib/types.d.ts](/Users/sudheer.t/Documents/github/agora-next/src/lib/types.d.ts)
- [x] Emit canonical `kind` metadata from archive normalization
- [x] Emit canonical `kind` metadata from live proposal parsing
- [x] Replace remaining `startsWith("OFFCHAIN")` checks with taxonomy helpers
- [ ] Add tests for `fromLegacyProposalType()` and `toLegacyProposalType()`

## Phase 2: Data Adapters And Repositories

- [x] Create `src/features/proposals/data/repositories/getProposal.ts`
- [x] Create `src/features/proposals/data/repositories/getProposals.ts`
- [x] Create `src/features/proposals/data/repositories/getProposalTypes.ts`
- [x] Extract DAO node fetch/adapt logic from [src/app/api/common/proposals/getProposals.ts](/Users/sudheer.t/Documents/github/agora-next/src/app/api/common/proposals/getProposals.ts)
- [x] Extract hybrid/offchain resolution from [src/app/api/common/proposals/getProposals.ts](/Users/sudheer.t/Documents/github/agora-next/src/app/api/common/proposals/getProposals.ts)
- [ ] Move archive adapters under `src/features/proposals/data/adapters/`
      `fromArchive.ts` now owns the feature-facing archive normalization entrypoint, and central runtime callers use it. The underlying implementation still lives in `src/lib/proposals/normalizeArchive.ts`.
- [x] Reduce route-layer files in `src/app/api/common/proposals/` to orchestration only
      `getProposals.ts` now delegates list fetch, detail fetch, and proposal-type fetch to repository modules.

## Phase 3: Variant Modules

- [x] Create `src/features/proposals/variants/standard/`
- [x] Create `src/features/proposals/variants/approval/`
- [x] Create `src/features/proposals/variants/optimistic/`
- [x] Create `src/features/proposals/variants/snapshot/`
- [x] Move parse logic out of [src/lib/proposalUtils.ts](/Users/sudheer.t/Documents/github/agora-next/src/lib/proposalUtils.ts)
      `parseProposalData()` now delegates to per-variant parser modules, and shared parser helpers live in `src/lib/proposalUtils/parsers/shared.ts`.
- [x] Move status logic out of [src/lib/proposalUtils/proposalStatus.ts](/Users/sudheer.t/Documents/github/agora-next/src/lib/proposalUtils/proposalStatus.ts)
      `getProposalStatus()` now keeps lifecycle gating and shared hybrid metric calls, while variant-specific status branches live under `src/features/proposals/variants/*/status.ts`.
- [ ] Keep `src/lib/proposalUtils.ts` as a compatibility facade during migration

## Phase 4: UI Registries

- [ ] Keep [src/components/Proposals/ProposalPage/registry.ts](/Users/sudheer.t/Documents/github/agora-next/src/components/Proposals/ProposalPage/registry.ts) as the pattern to expand
- [x] Add a list-row registry for [src/components/Proposals/Proposal/Proposal.tsx](/Users/sudheer.t/Documents/github/agora-next/src/components/Proposals/Proposal/Proposal.tsx)
      Proposal list-row status rendering now goes through `src/components/Proposals/Proposal/registry.tsx` instead of a type-conditional block in `Proposal.tsx`.
- [x] Add sponsor-action registry for [src/app/proposals/sponsor/components/SponsorActions.tsx](/Users/sudheer.t/Documents/github/agora-next/src/app/proposals/sponsor/components/SponsorActions.tsx)
      On-chain sponsor actions now resolve through `src/app/proposals/sponsor/components/registry.tsx`, while `SponsorActions.tsx` keeps only off-chain and hybrid flow composition.
- [x] Add draft-stage registry for [src/app/proposals/draft/components/DraftProposalForm.tsx](/Users/sudheer.t/Documents/github/agora-next/src/app/proposals/draft/components/DraftProposalForm.tsx)
      Draft stage rendering now resolves through `src/app/proposals/draft/components/registry.tsx`, and `DraftProposalForm.tsx` no longer owns the stage switch.
- [ ] Replace repeated `proposal.proposalType === ...` conditionals with selectors and registries
      Phase 4 registries now cover proposal pages, proposal list-row status, sponsor on-chain actions, draft stages, and hybrid optimistic vote-card selection. Proposal description and non-voter list surfaces now use shared selectors for snapshot/hybrid/govless-offchain behavior. Remaining proposal-type conditionals are concentrated in share/dialog flows, voting list variants, and a few proposal detail helpers.

## Phase 5: Authoring Unification

- [x] Create `src/features/proposals/authoring/shared/`
- [ ] Consolidate shared authoring types from [src/app/create/types.ts](/Users/sudheer.t/Documents/github/agora-next/src/app/create/types.ts) and [src/app/proposals/draft/types.ts](/Users/sudheer.t/Documents/github/agora-next/src/app/proposals/draft/types.ts)
      Shared authoring voting/post/approval definitions now live under `src/features/proposals/authoring/shared/`, and both `app/create/types.ts` and draft form metadata reuse that layer. Proposal-type filtering plus approval-tempcheck extraction/settings mapping also moved into that shared layer, replacing the old create-only filter util. Draft database/form types are still local to `src/app/proposals/draft/types.ts`.
- [ ] Rename colliding concepts:
- [x] `PostType` -> `AuthoringEntryType`
      `src/features/proposals/authoring/shared/` and the create flow now use `AuthoringEntryType` as the primary name. `PostType` remains as a compatibility alias while downstream callers finish migrating.
- [ ] draft `ProposalType` -> `DraftVotingModuleType`
      `DraftVotingModuleType` is now introduced as a compatibility alias in `src/app/proposals/draft/types.ts`, and the central draft/create-proposal form surfaces now use it. The rest of the draft domain still references `ProposalType`.
- [ ] runtime `ProposalType` -> `LegacyProposalType`
      `LegacyProposalType` is already the canonical taxonomy name in `src/features/proposals/domain/`, and `src/lib/types.d.ts` now re-exports it explicitly. Central proposal model declarations are starting to consume that name, but most runtime parsing code still references `ProposalType`.
- [x] Centralize proposal-type metadata and filtering
      Entry-type filtering, voting-type-based proposal-type filtering, proposal-type normalization, metadata retrieval, and shared select-option/label formatting now live in `src/features/proposals/authoring/shared/`. Create and draft now both read proposal/voting metadata from that shared layer.
- [ ] Decide long-term ownership between `src/app/create/` and `src/app/proposals/draft/`

## Phase 6: Cleanup

- [ ] Remove compatibility re-export [src/components/Proposals/Proposal/Archive/archiveProposalUtils.ts](/Users/sudheer.t/Documents/github/agora-next/src/components/Proposals/Proposal/Archive/archiveProposalUtils.ts)
- [ ] Move proposal-specific helpers out of generic utility files
- [ ] Remove duplicate proposal display label logic
- [ ] Eliminate `any`-typed proposal-type metadata in draft and create flows
- [ ] Delete transitional legacy-only helpers once callers move to canonical `kind`
