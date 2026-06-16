import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  checkWalletReadinessOrCloseTrace,
  getWalletTransactionReadinessError,
} from "../transactionReadiness";

const { closeFrontendMiradorFlowTraceMock } = vi.hoisted(() => ({
  closeFrontendMiradorFlowTraceMock: vi.fn(),
}));

vi.mock("@/lib/mirador/frontendFlowTrace", () => ({
  closeFrontendMiradorFlowTrace: closeFrontendMiradorFlowTraceMock,
}));

describe("getWalletTransactionReadinessError", () => {
  it("blocks transactions while the wallet is reconnecting", () => {
    const error = getWalletTransactionReadinessError({
      connector: {
        getAccounts: async () => [],
        getChainId: async () => 1,
      },
      status: "reconnecting",
    });

    expect(error?.message).toContain("still reconnecting");
  });

  it("blocks serialized connector shells without live methods", () => {
    const error = getWalletTransactionReadinessError({
      connector: {},
      status: "connected",
    });

    expect(error?.message).toContain("still initializing");
  });

  it("allows connected wallets with live connector methods", () => {
    const error = getWalletTransactionReadinessError({
      connector: {
        getAccounts: async () => ["0x0000000000000000000000000000000000000000"],
        getChainId: async () => 1,
      },
      status: "connected",
    });

    expect(error).toBeNull();
  });
});

describe("checkWalletReadinessOrCloseTrace", () => {
  beforeEach(() => {
    closeFrontendMiradorFlowTraceMock.mockClear();
  });

  it("returns null and leaves the trace open when the wallet is ready", () => {
    const trace = { id: "trace" } as never;
    const traceRef = { current: trace };

    const error = checkWalletReadinessOrCloseTrace({
      connector: {
        getAccounts: async () => [],
        getChainId: async () => 1,
      },
      status: "connected",
      trace,
      traceRef,
      reason: "governance_delegation_failed",
      eventName: "governance_delegation_failed",
      details: { delegatee: "0x0", action: "undelegate" },
    });

    expect(error).toBeNull();
    expect(closeFrontendMiradorFlowTraceMock).not.toHaveBeenCalled();
    expect(traceRef.current).toBe(trace);
  });

  it("closes the trace with the caller's flow semantics when not ready", () => {
    const trace = { id: "trace" } as never;
    const traceRef = { current: trace };

    const error = checkWalletReadinessOrCloseTrace({
      connector: {},
      status: "reconnecting",
      trace,
      traceRef,
      reason: "governance_delegation_failed",
      eventName: "governance_delegation_failed",
      details: { delegatee: "0x0", action: "undelegate" },
    });

    expect(error?.message).toContain("still reconnecting");
    expect(closeFrontendMiradorFlowTraceMock).toHaveBeenCalledWith(
      trace,
      expect.objectContaining({
        reason: "governance_delegation_failed",
        eventName: "governance_delegation_failed",
        details: expect.objectContaining({
          delegatee: "0x0",
          action: "undelegate",
          error: error?.message,
        }),
      })
    );
    expect(traceRef.current).toBeNull();
  });
});
