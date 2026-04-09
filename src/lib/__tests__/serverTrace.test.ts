import { beforeEach, describe, expect, it, vi } from "vitest";

const { getMiradorServerClientMock } = vi.hoisted(() => ({
  getMiradorServerClientMock: vi.fn(),
}));
const { isMiradorFlowTracingEnabledMock } = vi.hoisted(() => ({
  isMiradorFlowTracingEnabledMock: vi.fn(() => true),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/mirador/config", () => ({
  isMiradorFlowTracingEnabled: isMiradorFlowTracingEnabledMock,
}));

vi.mock("@/lib/mirador/serverClient", () => ({
  getMiradorServerClient: getMiradorServerClientMock,
}));

import { appendServerTraceEvent } from "@/lib/mirador/serverTrace";

describe("serverTrace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isMiradorFlowTracingEnabledMock.mockReturnValue(true);
  });

  it("forwards tx, safe message, and safe tx hints through the web3 plugin", async () => {
    const trace = {
      addAttributes: vi.fn(),
      addTags: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      web3: {
        evm: {
          addInputData: vi.fn(),
          addTxHint: vi.fn(),
        },
        safe: {
          addMsgHint: vi.fn(),
          addTxHint: vi.fn(),
        },
      },
      flush: vi.fn(),
    };
    const client = {
      trace: vi.fn(() => trace),
    };

    getMiradorServerClientMock.mockReturnValue(client);

    await appendServerTraceEvent({
      traceContext: {
        traceId: "trace-id",
        flow: "proposal_creation",
      },
      eventName: "safe_tracked_transaction_recorded",
      tags: ["proposal_creation", "safe"],
      txHashHints: [
        {
          txHash: "0xtx",
          chain: "ethereum",
          details: "proposal publish tx",
        },
      ],
      safeMessageHints: [
        {
          safeMessageHash: "0xsafe-message",
          chain: "ethereum",
          details: "Safe SIWE message",
        },
      ],
      safeTxHints: [
        {
          safeTxHash: "0xsafe-tx",
          chain: "ethereum",
          details: "Safe multisig proposal",
        },
      ],
      txInputData: ["0xa9059cbb", "0x"],
    });

    expect(client.trace).toHaveBeenCalledWith(
      expect.objectContaining({
        traceId: "trace-id",
        name: "proposal_creation",
        captureStackTrace: false,
        autoKeepAlive: false,
      })
    );
    expect(trace.web3.evm.addTxHint).toHaveBeenCalledWith(
      "0xtx",
      "ethereum",
      "proposal publish tx"
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
    expect(trace.web3.evm.addInputData).toHaveBeenCalledTimes(1);
    expect(trace.web3.evm.addInputData).toHaveBeenCalledWith("0xa9059cbb");
    expect(trace.flush).toHaveBeenCalledTimes(1);
  });

  it("uses info severity for success events", async () => {
    const trace = {
      addAttributes: vi.fn(),
      addTags: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      web3: {
        evm: {},
        safe: {},
      },
      flush: vi.fn(),
    };
    const client = {
      trace: vi.fn(() => trace),
    };

    getMiradorServerClientMock.mockReturnValue(client);

    await appendServerTraceEvent({
      traceContext: { traceId: "trace-id", flow: "proposal_creation" },
      eventName: "proposal_publish_succeeded",
    });

    expect(trace.info).toHaveBeenCalledWith(
      "proposal_publish_succeeded",
      undefined
    );
    expect(trace.warn).not.toHaveBeenCalled();
    expect(trace.error).not.toHaveBeenCalled();
  });

  it("uses error severity for failed events", async () => {
    const trace = {
      addAttributes: vi.fn(),
      addTags: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      web3: {
        evm: {},
        safe: {},
      },
      flush: vi.fn(),
    };
    const client = {
      trace: vi.fn(() => trace),
    };

    getMiradorServerClientMock.mockReturnValue(client);

    await appendServerTraceEvent({
      traceContext: { traceId: "trace-id", flow: "proposal_creation" },
      eventName: "proposal_publish_failed",
      details: { reason: "timeout" },
    });

    expect(trace.error).toHaveBeenCalledWith(
      "proposal_publish_failed",
      '{"reason":"timeout"}'
    );
    expect(trace.info).not.toHaveBeenCalled();
  });

  it("skips appending events for disabled flows", async () => {
    isMiradorFlowTracingEnabledMock.mockReturnValue(false);

    await appendServerTraceEvent({
      traceContext: { traceId: "trace-id", flow: "governance_vote" },
      eventName: "governance_vote_started",
    });

    expect(getMiradorServerClientMock).not.toHaveBeenCalled();
  });
});
