# Plan for Remaining E2E Tests

Based on the `Agora Next Test Cases.csv` file and a review of the currently opened PRs (`feat/header-footer` and `feature/playwright-web3-flows`), here is the plan to implement the remaining test cases. This plan aims to avoid conflicting with the tests currently being reviewed in those PRs.

## 1. Tests Already Covered (Do Not Touch)

The following test suites are fully or mostly covered in the existing PRs:

- **Delegates List (`DEL-LIST-001` to `021`)**: Covered in `tests/web3/delegates-ui.spec.ts` and `delegates-list-missing.spec.ts`.
- **Delegate Info (`DEL-INFO-001` to `016`)**: Covered in `tests/web3/delegate-info.spec.ts`.
- **Delegation (`DELEGATION-001` to `008`)**: Covered in `tests/web3/delegation.spec.ts`.
- **User Profile (`USER-PRO-001` to `010`)**: Covered in `tests/web3/user-profile.spec.ts`.
- **Header & Footer (`HEAD-NAV-001` to `006`, `FOOTER-001` to `009`)**: Covered in `tests/header-nav.spec.ts` and `tests/footer.spec.ts`.
- **Proposal List (`PROP-001` to `011`)**: Covered in `tests/web3/proposal-list.spec.ts` and `tests/web3/proposals-creation.spec.ts`.
- **Basic Proposal Creation (`TC-CREATE-001/002`, `GP-CREATE-001/002`, `STANDARD-001`)**: Covered in `tests/web3/proposals-creation.spec.ts`.

## 2. Missing Tests to Implement in This Branch

The following categories of tests remain missing or incomplete and should be the focus of the new implementation:

### 2.1. OODAO/EAS Governance Proposal Creation

Missing IDs: `TC-CREATE-003` to `007`, `GP-CREATE-003` to `008`

- **Objective:** Test permissions, proposal types, related discussions, and related temp checks.
- **Tenant Context:** These rely on the UI feature flag `has-eas-oodao: true` which is enabled on tenants like `towns`, `syndicate`, `demo2`, `demo3`, `demo4`.

### 2.2. Standard Proposal States

Missing IDs: `STANDARD-002` to `STANDARD-014`

- **Objective:** Test proposal states for `BASIC` proposals (PENDING, ACTIVE, PASSED, QUEUED, EXECUTED, CANCELLED, EXPIRED, DEFEATED for both quorum and approval thresholds) and verify voting works.
- **Tenant Context:** Requires a tenant with `proposal-lifecycle.config.proposalTypes` containing `BASIC`. Found in almost all tenants.

### 2.3. Optimistic Proposals

Missing IDs: `OPTIMISTIC-001` to `OPTIMISTIC-009`

- **Objective:** Test `OPTIMISTIC` proposal UI flows, veto threshold rendering, "Not open to voting" states, and the specific optimistic vote controls (only Against allowed).
- **Tenant Context:** Requires tenants where `ProposalType?.OPTIMISTIC` is enabled. Enabled in `boost`, `scroll`, `derive`, `xai`, `demo`, `b3`.

### 2.4. Approval Proposals

Missing IDs: `APPROVAL-001` to `APPROVAL-015`

- **Objective:** Test `APPROVAL` proposals UI states, multiple candidate selections, single/multiple options logic, threshold-based results, and top-choices results.
- **Tenant Context:** Requires a tenant configuration where `ProposalType?.APPROVAL` is enabled in `src/lib/tenant/configs/ui` and `governorApprovalModule` is set in `src/lib/tenant/configs/contracts`. Configured in `derive`, `cyber`, `linea`, `demo`, `b3`, `boost`, `scroll`, `xai`.

### 2.5. Quorum & Voting Requirements

Missing IDs: `QUO-001` to `QUO-003`, `VOTE-REQ-001` to `VOTE-REQ-002`

- **Objective:** Validate correct calculation of Quorum (depending on whether the governor is ENS, BRAVO, or default) and ensure that voting requires a delegate statement if configured.
- **Tenant Context:**
  - Quorum calculations depend on `governorType` defined in `src/lib/tenant/configs/contracts/` (e.g., ENS vs BRAVO).
  - `VOTE-REQ` depends on the `delegates/votingRequiresStatement` flag in `ui` configs (set to false dynamically or overridden).

### 2.6. Info Page Content

Missing IDs: `INFO-001` to `INFO-003`

- **Objective:** Validate "Governor Settings" visibility, "View DUNA Member Disclosures", and "Formation Documents" rendering on the `/info` page.
- **Tenant Context:**
  - `INFO-001` is controlled by `hide-governor-settings` (e.g., true in `towns.tsx`, meaning settings should be hidden).
  - `INFO-002` & `INFO-003` are controlled by the `duna` flag being active in the tenant UI config (e.g., `towns`).

### 2.7. Header Nav Bar Missing Edge Case

Missing ID: `HEAD-NAV-007`

- **Objective:** Verify "Financials" link is present and links to `/financials` page.
- **Tenant Context:** Controlled by `duna/financial-statements` in the UI config (e.g., enabled in `towns.tsx`).

---

## 3. Implementation Strategy

1. **New Spec Files:** Create modular files under `tests/web3/` (or `tests/e2e/`) to handle the different groups above (e.g., `optimistic-proposals.spec.ts`, `approval-proposals.spec.ts`, `standard-proposals-state.spec.ts`, `info-page.spec.ts`).
2. **Tenant Fixtures:** Ensure the Playwright setup intercepts `/api/tenant` or modifies the URL header to test under specific tenants. For example:
   - For `OPTIMISTIC` and `APPROVAL` tests: test against `derive` or `demo`.
   - For `has-eas-oodao` and `duna` features: test against `towns`.
3. **Execution Plan:** Avoid touching `proposal-create.spec.ts`, `proposal-list.spec.ts`, or any core components currently being modified by PRs 1463 and 1458. The tests designed in this branch should stand independently, focusing solely on the unaddressed logic.
