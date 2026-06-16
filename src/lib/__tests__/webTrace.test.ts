import { describe, expect, it, vi } from "vitest";

import {
  addMiradorEvent,
  addMiradorSafeMsgHint,
  addMiradorSafeTxHint,
  addMiradorTxInputData,
  closeMiradorTrace,
  getMiradorTraceId,
} from "@/lib/mirador/webTrace";

describe("webTrace", () => {
  it("uses error severity for failed events", () => {
    const trace = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    addMiradorEvent(trace as any, "vote_submission_failed", {
      error: "network timeout",
    });

    expect(trace.error).toHaveBeenCalledWith("vote_submission_failed", {
      error: "network timeout",
    });
    expect(trace.info).not.toHaveBeenCalled();
    expect(trace.warn).not.toHaveBeenCalled();
  });

  it("uses info severity when a failed event is user rejection", () => {
    const trace = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    const details = {
      error:
        "User rejected the request. MetaMask Tx Signature: User denied transaction signature.",
    };

    addMiradorEvent(trace as any, "vote_submission_failed", details);

    expect(trace.info).toHaveBeenCalledWith("vote_submission_failed", details);
    expect(trace.error).not.toHaveBeenCalled();
    expect(trace.warn).not.toHaveBeenCalled();
  });

  it("uses info severity for wallet cancellation error codes", () => {
    const trace = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    const details = {
      error: {
        code: 4001,
        message: "User rejected the request.",
      },
    };

    addMiradorEvent(trace as any, "wallet_signature_failed", details);

    expect(trace.info).toHaveBeenCalledWith("wallet_signature_failed", details);
    expect(trace.error).not.toHaveBeenCalled();
    expect(trace.warn).not.toHaveBeenCalled();
  });

  it("uses info severity for nested wallet error objects", () => {
    const trace = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    const walletError = Object.assign(new Error("User rejected the request."), {
      code: 4001,
    });
    const details = { error: walletError };

    addMiradorEvent(trace as any, "wallet_signature_failed", details);

    expect(trace.info).toHaveBeenCalledWith("wallet_signature_failed", details);
    expect(trace.error).not.toHaveBeenCalled();
    expect(trace.warn).not.toHaveBeenCalled();
  });

  it("uses info severity for exited wallet link flows", () => {
    const trace = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    const details = {
      errorCode: "exited_link_flow",
    };

    addMiradorEvent(trace as any, "wallet_link_failed", details);

    expect(trace.info).toHaveBeenCalledWith("wallet_link_failed", details);
    expect(trace.error).not.toHaveBeenCalled();
    expect(trace.warn).not.toHaveBeenCalled();
  });

  it("returns the trace id synchronously from the v2 SDK", () => {
    const trace = {
      getTraceId: vi.fn(() => "trace-id"),
    };

    expect(getMiradorTraceId(trace as any)).toBe("trace-id");
  });

  it("returns null when trace is missing", () => {
    expect(getMiradorTraceId(null)).toBeNull();
    expect(getMiradorTraceId(undefined)).toBeNull();
  });

  it("delegates trace closing to the SDK close API", async () => {
    const trace = {
      getTraceId: vi.fn(() => "trace-id"),
      close: vi.fn(async () => undefined),
    };

    await closeMiradorTrace(trace as any, "done");

    expect(trace.close).toHaveBeenCalledWith("done");
  });

  it("handles close errors gracefully", async () => {
    const trace = {
      getTraceId: vi.fn(() => "trace-id"),
      close: vi.fn(async () => {
        throw new Error("close failed");
      }),
    };
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await closeMiradorTrace(trace as any, "done");

    expect(consoleSpy).toHaveBeenCalledWith(
      "[mirador-close] client close failed",
      expect.objectContaining({ traceId: "trace-id", reason: "done" })
    );
    consoleSpy.mockRestore();
  });

  it("skips empty tx input data placeholders", () => {
    const trace = {
      web3: {
        evm: {
          addInputData: vi.fn(),
        },
      },
    };

    addMiradorTxInputData(trace as any, "0x");
    addMiradorTxInputData(trace as any, "0xa9059cbb");

    expect(trace.web3.evm.addInputData).toHaveBeenCalledTimes(1);
    expect(trace.web3.evm.addInputData).toHaveBeenCalledWith("0xa9059cbb");
  });

  it("forwards safe hints to the SDK web3 plugin", () => {
    const trace = {
      web3: {
        evm: {},
        safe: {
          addMsgHint: vi.fn(),
          addTxHint: vi.fn(),
        },
      },
    };

    addMiradorSafeMsgHint(
      trace as any,
      "0xsafe-message",
      "ethereum",
      "Safe SIWE message"
    );
    addMiradorSafeTxHint(
      trace as any,
      "0xsafe-tx",
      "ethereum",
      "Safe multisig proposal"
    );

    expect(trace.web3.safe.addMsgHint).toHaveBeenCalledWith(
      "0xsafe-message",
      "ethereum",
      "Safe SIWE message"
    );
    expect(trace.web3.safe.addTxHint).toHaveBeenCalledWith(
      "0xsafe-tx",
      "ethereum",
      "Safe multisig proposal"
    );
  });
});
