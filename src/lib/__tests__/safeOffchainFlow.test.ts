import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  SAFE_OFFCHAIN_PROPOSAL_FLOW_TIMEOUT_MS,
  clearStoredSafeProposalOffchainFlowState,
  getStoredSafeProposalOffchainFlowState,
  initializeSafeProposalOffchainFlow,
  isSafeProposalOffchainFlowActive,
  isSafeProposalOffchainFlowExpired,
  markSafeProposalOffchainMessageCreated,
  setSafeProposalOffchainFlowStatus,
} from "@/lib/safeOffchainFlow";

describe("safeOffchainFlow", () => {
  beforeEach(() => {
    vi.useRealTimers();
    clearStoredSafeProposalOffchainFlowState();
  });

  it("initializes the Safe offchain flow in pending_wallet state", () => {
    const state = initializeSafeProposalOffchainFlow({
      safeAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
    });

    expect(state).toEqual({
      safeAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
      status: "pending_wallet",
    });
    expect(getStoredSafeProposalOffchainFlowState()).toEqual(state);
    expect(isSafeProposalOffchainFlowActive(state)).toBe(true);
  });

  it("stores the canonical Safe message hash and timeout window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-07T00:00:00.000Z"));

    const state = markSafeProposalOffchainMessageCreated({
      safeAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
      messageHash:
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    });

    expect(state.status).toBe("waiting_for_signatures");
    expect(state.startedAt).toBe(Date.parse("2026-03-07T00:00:00.000Z"));
    expect(state.expiresAt).toBe(
      Date.parse("2026-03-07T00:00:00.000Z") +
        SAFE_OFFCHAIN_PROPOSAL_FLOW_TIMEOUT_MS
    );
    expect(getStoredSafeProposalOffchainFlowState()).toEqual(state);
    expect(isSafeProposalOffchainFlowActive(state)).toBe(true);
    expect(isSafeProposalOffchainFlowExpired(state)).toBe(false);
  });

  it("marks the flow as expired after the deadline passes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-07T00:00:00.000Z"));

    markSafeProposalOffchainMessageCreated({
      safeAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
      messageHash:
        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      timeoutMs: 5_000,
    });
    setSafeProposalOffchainFlowStatus("verifying");

    vi.advanceTimersByTime(5_001);

    const state = getStoredSafeProposalOffchainFlowState();
    expect(state?.status).toBe("verifying");
    expect(isSafeProposalOffchainFlowExpired(state)).toBe(true);
  });
});
