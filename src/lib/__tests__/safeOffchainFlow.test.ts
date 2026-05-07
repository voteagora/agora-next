import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  SAFE_OFFCHAIN_PROPOSAL_FLOW_TIMEOUT_MS,
  clearStoredSafeProposalOffchainFlowState,
  getStoredSafeProposalOffchainFlowState,
  initializeSafeProposalOffchainFlow,
  isSafeProposalOffchainFlowActive,
  isSafeProposalOffchainFlowExpired,
  isSafeProposalOffchainFlowTerminal,
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
      purpose: "proposal_draft",
      signingKind: "siwe",
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
      message: "Safe message",
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
    expect(isSafeProposalOffchainFlowTerminal(state)).toBe(false);
  });

  it("returns the same snapshot object while storage is unchanged", () => {
    initializeSafeProposalOffchainFlow({
      safeAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
    });

    const firstSnapshot = getStoredSafeProposalOffchainFlowState();
    const secondSnapshot = getStoredSafeProposalOffchainFlowState();

    expect(firstSnapshot).toBe(secondSnapshot);
  });

  it("marks the flow as expired after the deadline passes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-07T00:00:00.000Z"));

    markSafeProposalOffchainMessageCreated({
      safeAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
      messageHash:
        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      message: "Safe message",
      timeoutMs: 5_000,
    });
    setSafeProposalOffchainFlowStatus("verifying");

    vi.advanceTimersByTime(5_001);

    const state = getStoredSafeProposalOffchainFlowState();
    expect(state?.status).toBe("verifying");
    expect(isSafeProposalOffchainFlowExpired(state)).toBe(true);
    expect(isSafeProposalOffchainFlowTerminal(state)).toBe(false);
  });

  it("stores the flow purpose for notification preferences", () => {
    const state = initializeSafeProposalOffchainFlow({
      safeAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
      purpose: "notification_preferences",
    });

    expect(state.purpose).toBe("notification_preferences");
    expect(getStoredSafeProposalOffchainFlowState()?.purpose).toBe(
      "notification_preferences"
    );
  });

  it("stores the signing kind and delegate statement purpose", () => {
    const state = initializeSafeProposalOffchainFlow({
      safeAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
      purpose: "delegate_statement",
      signingKind: "raw_message",
    });

    expect(state.purpose).toBe("delegate_statement");
    expect(state.signingKind).toBe("raw_message");
  });

  it("supports delegate statement Safe SIWE flows", () => {
    const state = initializeSafeProposalOffchainFlow({
      safeAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
      purpose: "delegate_statement",
      signingKind: "siwe",
    });

    expect(state.purpose).toBe("delegate_statement");
    expect(state.signingKind).toBe("siwe");
  });

  it("treats expired, cancelled, and failed flows as terminal", () => {
    expect(
      isSafeProposalOffchainFlowTerminal({
        purpose: "proposal_draft",
        signingKind: "siwe",
        safeAddress: "0x1234567890123456789012345678901234567890",
        chainId: 1,
        status: "expired",
      })
    ).toBe(true);
    expect(
      isSafeProposalOffchainFlowTerminal({
        purpose: "proposal_draft",
        signingKind: "siwe",
        safeAddress: "0x1234567890123456789012345678901234567890",
        chainId: 1,
        status: "cancelled",
      })
    ).toBe(true);
    expect(
      isSafeProposalOffchainFlowTerminal({
        purpose: "proposal_draft",
        signingKind: "siwe",
        safeAddress: "0x1234567890123456789012345678901234567890",
        chainId: 1,
        status: "failed",
      })
    ).toBe(true);
  });
});
