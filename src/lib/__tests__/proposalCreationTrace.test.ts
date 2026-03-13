import { beforeEach, describe, expect, it, vi } from "vitest";

import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import {
  clearStoredProposalCreationTraceState,
  closeStoredProposalCreationTrace,
  getStoredProposalCreationTraceState,
  startOrResumeProposalCreationTrace,
  startFreshProposalCreationTrace,
  setStoredProposalCreationTraceState,
} from "@/lib/mirador/proposalCreationTrace";
import {
  addMiradorAttributes,
  addMiradorEvent,
  closeMiradorTrace,
  flushMiradorTrace,
  startMiradorTrace,
} from "@/lib/mirador/webTrace";

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      ui: {
        toggle: () => ({
          enabled: true,
          config: {
            proposalCreation: true,
            siweLoginTracing: true,
          },
        }),
      },
    }),
  },
}));

vi.mock("@/lib/mirador/webTrace", () => ({
  addMiradorAttributes: vi.fn(),
  addMiradorEvent: vi.fn(),
  closeMiradorTrace: vi.fn(),
  flushAndWaitForMiradorTraceId: vi.fn(),
  flushMiradorTrace: vi.fn(),
  startMiradorTrace: vi.fn(),
}));

describe("closeStoredProposalCreationTrace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearStoredProposalCreationTraceState();
  });

  it("does not create a new trace when session storage is already empty", async () => {
    await closeStoredProposalCreationTrace({
      eventName: "safe_proposal_session_missing",
      reason: "safe_proposal_session_missing",
    });

    expect(startMiradorTrace).not.toHaveBeenCalled();
    expect(addMiradorEvent).not.toHaveBeenCalled();
    expect(closeMiradorTrace).not.toHaveBeenCalled();
  });

  it("resumes the stored trace when closing an existing proposal creation session", async () => {
    const trace = { id: "trace" };
    (startMiradorTrace as any).mockReturnValue(trace);

    setStoredProposalCreationTraceState({
      traceId: "trace-123",
      flow: MIRADOR_FLOW.proposalCreation,
      branch: "safe_offchain_draft",
      walletAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
      safeAddress: "0x1234567890123456789012345678901234567890",
      startedAt: Date.now(),
    });

    await closeStoredProposalCreationTrace({
      eventName: "safe_proposal_session_missing",
      details: "Session expired before draft creation.",
      reason: "safe_proposal_session_missing",
    });

    expect(startMiradorTrace).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "proposal_creation",
        flow: MIRADOR_FLOW.proposalCreation,
        tags: ["proposal_creation"],
        autoClose: true,
        context: expect.objectContaining({
          traceId: "trace-123",
          branch: "safe_offchain_draft",
          walletAddress: "0x1234567890123456789012345678901234567890",
          chainId: 1,
          sessionId: "trace-123",
        }),
      })
    );
    expect(addMiradorEvent).toHaveBeenCalledWith(
      trace,
      "safe_proposal_session_missing",
      "Session expired before draft creation."
    );
    expect(flushMiradorTrace).toHaveBeenCalledWith(trace);
    expect(closeMiradorTrace).toHaveBeenCalledWith(
      trace,
      "safe_proposal_session_missing"
    );
  });

  it("starts a fresh trace for a new Safe proposal attempt", () => {
    const trace = { id: "fresh-trace" };
    (startMiradorTrace as any).mockReturnValue(trace);

    setStoredProposalCreationTraceState({
      traceId: "trace-123",
      flow: MIRADOR_FLOW.proposalCreation,
      branch: "safe_offchain_draft",
      walletAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
      safeAddress: "0x1234567890123456789012345678901234567890",
      startedAt: Date.now(),
    });

    expect(
      startFreshProposalCreationTrace({
        walletAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        chainId: 1,
      })
    ).toBe(trace);

    expect(startMiradorTrace).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "proposal_creation",
        flow: MIRADOR_FLOW.proposalCreation,
        tags: ["proposal_creation"],
        autoClose: true,
        context: {
          branch: undefined,
          walletAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
          chainId: 1,
        },
      })
    );
    expect(getStoredProposalCreationTraceState()).toBeNull();
  });

  it("reuses the active browser trace handle for repeated resume calls", () => {
    const trace = {
      id: "trace",
      getTraceId: vi.fn(() => "trace-123"),
    };
    (startMiradorTrace as any).mockReturnValue(trace);

    setStoredProposalCreationTraceState({
      traceId: "trace-123",
      flow: MIRADOR_FLOW.proposalCreation,
      branch: "safe_offchain_draft",
      walletAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
      safeAddress: "0x1234567890123456789012345678901234567890",
      startedAt: Date.now(),
    });

    const firstTrace = startOrResumeProposalCreationTrace({
      walletAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
    });
    const secondTrace = startOrResumeProposalCreationTrace({
      branch: "safe_offchain_draft",
      walletAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
    });

    expect(firstTrace).toBe(trace);
    expect(secondTrace).toBe(trace);
    expect(startMiradorTrace).toHaveBeenCalledTimes(1);
    expect(addMiradorAttributes).toHaveBeenCalledWith(
      trace,
      expect.objectContaining({
        "proposal.branch": "safe_offchain_draft",
        "wallet.address": "0x1234567890123456789012345678901234567890",
        "wallet.chainId": 1,
        "session.id": "trace-123",
      })
    );
  });

  it("uses the active trace directly when closing to avoid keep-alive race conditions", async () => {
    const activeTrace = {
      id: "active-trace",
      getTraceId: vi.fn(() => "trace-123"),
    };

    (startMiradorTrace as any).mockReturnValueOnce(activeTrace);

    startFreshProposalCreationTrace({
      walletAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
    });
    setStoredProposalCreationTraceState({
      traceId: "trace-123",
      flow: MIRADOR_FLOW.proposalCreation,
      branch: "safe_offchain_draft",
      walletAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
      safeAddress: "0x1234567890123456789012345678901234567890",
      startedAt: Date.now(),
    });

    await closeStoredProposalCreationTrace({
      eventName: "safe_offchain_signing_timeout_reached",
      reason: "safe_offchain_signing_expired",
    });

    expect(startMiradorTrace).toHaveBeenCalledTimes(1);
    expect(addMiradorEvent).toHaveBeenCalledWith(
      activeTrace,
      "safe_offchain_signing_timeout_reached",
      undefined
    );
    expect(flushMiradorTrace).toHaveBeenCalledWith(activeTrace);
    expect(closeMiradorTrace).toHaveBeenCalledTimes(1);
    expect(closeMiradorTrace).toHaveBeenCalledWith(
      activeTrace,
      "safe_offchain_signing_expired"
    );
  });

  it("clears stored trace state before the Mirador close promise settles", async () => {
    const trace = { id: "trace" };
    let resolveClose: (() => void) | undefined;

    (startMiradorTrace as any).mockReturnValue(trace);
    (closeMiradorTrace as any).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveClose = resolve;
        })
    );

    setStoredProposalCreationTraceState({
      traceId: "trace-123",
      flow: MIRADOR_FLOW.proposalCreation,
      branch: "safe_offchain_draft",
      walletAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
      safeAddress: "0x1234567890123456789012345678901234567890",
      startedAt: Date.now(),
    });

    const closePromise = closeStoredProposalCreationTrace({
      eventName: "safe_proposal_session_missing",
      reason: "safe_proposal_session_missing",
    });

    expect(getStoredProposalCreationTraceState()).toBeNull();

    resolveClose?.();
    await closePromise;
  });
});
