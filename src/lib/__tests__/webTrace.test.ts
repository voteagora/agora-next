import { describe, expect, it, vi } from "vitest";

import {
  addMiradorSafeMsgHint,
  addMiradorSafeTxHint,
  addMiradorTxInputData,
  closeMiradorTrace,
  getMiradorTraceId,
} from "@/lib/mirador/webTrace";

describe("webTrace", () => {
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
