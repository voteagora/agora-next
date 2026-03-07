import { beforeEach, describe, expect, it, vi } from "vitest";

import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import {
  clearStoredProposalCreationTraceState,
  closeStoredProposalCreationTrace,
  setStoredProposalCreationTraceState,
} from "@/lib/mirador/proposalCreationTrace";
import {
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
            proposalCreationSiwe: true,
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
});
