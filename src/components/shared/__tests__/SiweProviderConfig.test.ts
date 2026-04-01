import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  addMiradorEventMock,
  flushMiradorTraceMock,
  getCanonicalSafeMessageHashMock,
  getMiradorChainNameFromChainIdMock,
  getStoredProposalCreationTraceStateMock,
  getStoredSafeSiweFlowStateMock,
  getStoredSiweLoginTraceStateMock,
  closeStoredProposalCreationTraceMock,
  closeStoredSiweLoginTraceMock,
  startOrResumeProposalCreationTraceMock,
  startOrResumeSiweLoginTraceMock,
  markSafeSiweMessageCreatedMock,
  setSafeSiweFlowStatusMock,
} = vi.hoisted(() => ({
  addMiradorEventMock: vi.fn(),
  flushMiradorTraceMock: vi.fn(),
  getCanonicalSafeMessageHashMock: vi.fn(),
  getMiradorChainNameFromChainIdMock: vi.fn(),
  getStoredProposalCreationTraceStateMock: vi.fn(),
  getStoredSafeSiweFlowStateMock: vi.fn(),
  getStoredSiweLoginTraceStateMock: vi.fn(),
  closeStoredProposalCreationTraceMock: vi.fn(),
  closeStoredSiweLoginTraceMock: vi.fn(),
  startOrResumeProposalCreationTraceMock: vi.fn(),
  startOrResumeSiweLoginTraceMock: vi.fn(),
  markSafeSiweMessageCreatedMock: vi.fn(),
  setSafeSiweFlowStatusMock: vi.fn(),
}));

vi.mock("@/lib/mirador/chains", () => ({
  getMiradorChainNameFromChainId: getMiradorChainNameFromChainIdMock,
}));

vi.mock("@/lib/mirador/proposalCreationTrace", () => ({
  closeStoredProposalCreationTrace: closeStoredProposalCreationTraceMock,
  getProposalCreationTraceHeaders: vi.fn(() => undefined),
  getStoredProposalCreationTraceState: getStoredProposalCreationTraceStateMock,
  isMiradorProposalCreationSiweTracingEnabled: vi.fn(() => false),
  startOrResumeProposalCreationTrace: startOrResumeProposalCreationTraceMock,
}));

vi.mock("@/lib/mirador/siweLoginTrace", () => ({
  closeStoredSiweLoginTrace: closeStoredSiweLoginTraceMock,
  getSiweLoginTraceHeaders: vi.fn(() => undefined),
  getStoredSiweLoginTraceState: getStoredSiweLoginTraceStateMock,
  startOrResumeSiweLoginTrace: startOrResumeSiweLoginTraceMock,
}));

vi.mock("@/lib/mirador/webTrace", () => ({
  addMiradorEvent: addMiradorEventMock,
  addMiradorSafeMsgHint: vi.fn(),
  flushMiradorTrace: flushMiradorTraceMock,
}));

vi.mock("@/lib/safeMessages", () => ({
  getCanonicalSafeMessageHash: getCanonicalSafeMessageHashMock,
}));

vi.mock("@/lib/safeOffchainFlow", () => ({
  clearStoredSafeSiweFlowState: vi.fn(),
  getStoredSafeSiweFlowState: getStoredSafeSiweFlowStateMock,
  isSafeSiweFlowActive: vi.fn(() => true),
  isSafeSiweFlowExpired: vi.fn(() => false),
  isSafeSiweFlowTerminal: vi.fn(() => false),
  markSafeSiweMessageCreated: markSafeSiweMessageCreatedMock,
  setSafeSiweFlowStatus: setSafeSiweFlowStatusMock,
}));

vi.mock("@/lib/siweSession", () => ({
  SIWE_SESSION_CHANGE_EVENT: "agora:siwe-session-change",
  clearStoredSiweSession: vi.fn(),
  getStoredSiweSession: vi.fn(() => null),
}));

describe("siweProviderConfig.createMessage", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    getStoredProposalCreationTraceStateMock.mockReturnValue(null);
    getStoredSafeSiweFlowStateMock.mockReturnValue({
      purpose: "delegate_statement",
      signingKind: "siwe",
      safeAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
      status: "pending_wallet",
    });
    getStoredSiweLoginTraceStateMock.mockReturnValue({
      purpose: "delegate_statement",
      walletAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
    });
    startOrResumeSiweLoginTraceMock.mockReturnValue({
      getTraceId: vi.fn(() => "trace-id"),
    });
    closeStoredSiweLoginTraceMock.mockResolvedValue(undefined);
    getMiradorChainNameFromChainIdMock.mockReturnValue("ethereum");
  });

  it("aborts Safe SIWE message creation when canonical hash generation fails", async () => {
    getCanonicalSafeMessageHashMock.mockRejectedValue(
      new Error("hash generation failed")
    );

    const { siweProviderConfig } = await import("../SiweProviderConfig");

    await expect(
      siweProviderConfig.createMessage?.({
        nonce: "abcdef12",
        address: "0x1234567890123456789012345678901234567890",
        chainId: 1,
      })
    ).rejects.toThrow("hash generation failed");

    expect(setSafeSiweFlowStatusMock).toHaveBeenCalledWith(
      "failed",
      "hash generation failed"
    );
    expect(markSafeSiweMessageCreatedMock).not.toHaveBeenCalled();
    expect(closeStoredSiweLoginTraceMock).toHaveBeenCalledWith({
      eventName: "safe_message_hash_failed_closed",
      details: {
        reason: "hash generation failed",
      },
      reason: "safe_message_hash_failed",
    });
  });
});
