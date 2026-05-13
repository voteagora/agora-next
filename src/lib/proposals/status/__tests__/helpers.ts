import { vi } from "vitest";

// Mock Tenant – standard.ts and blockTimes.ts both call Tenant.current().
// Using "ens" namespace: quorum = forVotes + abstainVotes (default path).
// These mocks MUST be called before importing any modules that use Tenant
vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      namespace: "ens",
      ui: {
        toggle: (_name: string) => ({ enabled: false }),
      },
      contracts: {
        token: { chain: { id: 1 } },
        chainForTime: { id: 1 },
      },
    }),
  },
}));

vi.mock("server-only", () => ({}));

// ---------------------------------------------------------------------------
// Time constants
// ---------------------------------------------------------------------------

export const now = Math.floor(Date.now() / 1000);
export const PAST_START = now - 3600; // 1 h ago
export const PAST_END = now - 60; // 1 min ago (voting finished)
export const FUTURE_START = now + 3600; // starts in 1 h
export const FUTURE_END = now + 7200; // ends in 2 h

// ---------------------------------------------------------------------------
// Proposal factory helpers
// ---------------------------------------------------------------------------

/** Create the minimal base for a finished dao_node proposal */
export function makeDaoNodeBase(overrides: Record<string, unknown> = {}) {
  return {
    data_eng_properties: { source: "dao_node" },
    start_blocktime: PAST_START,
    end_blocktime: PAST_END,
    voting_module_name: "standard",
    totals: { "no-param": {} },
    proposal_type: 0,
    proposal_type_info: { approval_threshold: 0, quorum: 0, name: "basic" },
    ...overrides,
  } as any;
}

/** Create a finished eas-atlas proposal */
export function makeAtlasBase(overrides: Record<string, unknown> = {}) {
  return {
    data_eng_properties: { source: "eas-atlas" },
    start_blocktime: PAST_START,
    end_blocktime: PAST_END,
    ...overrides,
  } as any;
}

/** Create a finished eas-oodao proposal */
export function makeOodaoBase(overrides: Record<string, unknown> = {}) {
  return {
    data_eng_properties: { source: "eas-oodao" },
    start_blocktime: PAST_START,
    end_blocktime: PAST_END,
    voting_module: 1,
    proposal_type: { class: "STANDARD", quorum: 0, approval_threshold: 0 },
    ...overrides,
  } as any;
}
