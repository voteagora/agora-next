import { beforeEach, describe, expect, it, vi } from "vitest";

import { MIRADOR_FLOW } from "@/lib/mirador/constants";

const {
  addMiradorEventMock,
  addMiradorSafeTxHintMock,
  addMiradorTxHintMock,
  addMiradorTxInputDataMock,
  closeMiradorTraceMock,
  isMiradorFlowTracingEnabledMock,
  startMiradorTraceMock,
} = vi.hoisted(() => ({
  addMiradorEventMock: vi.fn(),
  addMiradorSafeTxHintMock: vi.fn(),
  addMiradorTxHintMock: vi.fn(),
  addMiradorTxInputDataMock: vi.fn(),
  closeMiradorTraceMock: vi.fn(),
  isMiradorFlowTracingEnabledMock: vi.fn(),
  startMiradorTraceMock: vi.fn(),
}));

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: undefined }),
}));

vi.mock("@/lib/utils", () => ({
  isSafeWallet: vi.fn().mockResolvedValue(false),
}));

vi.mock("@/lib/mirador/config", () => ({
  isMiradorFlowTracingEnabled: isMiradorFlowTracingEnabledMock,
}));

vi.mock("@/lib/mirador/webTrace", () => ({
  addMiradorEvent: addMiradorEventMock,
  addMiradorSafeTxHint: addMiradorSafeTxHintMock,
  addMiradorTxHint: addMiradorTxHintMock,
  addMiradorTxInputData: addMiradorTxInputDataMock,
  closeMiradorTrace: closeMiradorTraceMock,
  startMiradorTrace: startMiradorTraceMock,
}));

import {
  attachMiradorTransactionArtifacts,
  closeFrontendMiradorFlowTrace,
  startFrontendMiradorFlowTrace,
} from "@/lib/mirador/frontendFlowTrace";

describe("frontendFlowTrace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NEXT_PUBLIC_AGORA_INSTANCE_NAME;
    isMiradorFlowTracingEnabledMock.mockReturnValue(true);
  });

  it("does not start a trace when the flow flag is disabled", () => {
    isMiradorFlowTracingEnabledMock.mockReturnValue(false);

    const trace = startFrontendMiradorFlowTrace({
      name: "GovernanceVote",
      flow: MIRADOR_FLOW.governanceVote,
      step: "standard_vote_submit",
      startEventName: "governance_vote_started",
    });

    expect(trace).toBeNull();
    expect(isMiradorFlowTracingEnabledMock).toHaveBeenCalledWith(
      MIRADOR_FLOW.governanceVote
    );
    expect(startMiradorTraceMock).not.toHaveBeenCalled();
    expect(addMiradorEventMock).not.toHaveBeenCalled();
  });

  it("starts and tags a trace when the flow flag is enabled", () => {
    const trace = { id: "trace" };
    startMiradorTraceMock.mockReturnValue(trace);

    expect(
      startFrontendMiradorFlowTrace({
        name: "GovernanceVote",
        flow: MIRADOR_FLOW.governanceVote,
        step: "standard_vote_submit",
        context: {
          walletAddress: "0x1234567890123456789012345678901234567890",
          chainId: 1,
          proposalId: "31",
        },
        tags: ["governance", "vote", "frontend"],
        attributes: {
          voteKind: "standard",
        },
        startEventName: "governance_vote_started",
        startEventDetails: {
          proposalId: "31",
        },
      })
    ).toBe(trace);

    expect(startMiradorTraceMock).toHaveBeenCalledWith({
      name: "GovernanceVote",
      flow: MIRADOR_FLOW.governanceVote,
      context: {
        walletAddress: "0x1234567890123456789012345678901234567890",
        chainId: 1,
        proposalId: "31",
        source: "frontend",
        step: "standard_vote_submit",
      },
      tags: ["governance_vote", "governance", "vote", "frontend"],
      attributes: {
        voteKind: "standard",
      },
    });
    expect(addMiradorEventMock).toHaveBeenCalledWith(
      trace,
      "governance_vote_started",
      {
        proposalId: "31",
      }
    );
  });

  it("still closes trace handles through the Mirador close helper", async () => {
    const trace = { id: "trace" };

    await closeFrontendMiradorFlowTrace(trace as any, {
      reason: "governance_vote_succeeded",
      eventName: "governance_vote_succeeded",
      details: { proposalId: "31" },
    });

    expect(addMiradorEventMock).toHaveBeenCalledWith(
      trace,
      "governance_vote_succeeded",
      { proposalId: "31" }
    );
    expect(closeMiradorTraceMock).toHaveBeenCalledWith(
      trace,
      "governance_vote_succeeded"
    );
  });

  describe("attachMiradorTransactionArtifacts", () => {
    const trace = { id: "trace" } as any;
    const submittedHash = "0xaaa";
    const resolvedHash = "0xbbb";

    it("attaches a submission-only hash as an evm tx hint by default", () => {
      attachMiradorTransactionArtifacts(trace, {
        chainId: 1,
        submittedTxHash: submittedHash,
        submittedTxDetails: "Submitted governance vote transaction",
      });

      expect(addMiradorTxHintMock).toHaveBeenCalledTimes(1);
      expect(addMiradorTxHintMock).toHaveBeenCalledWith(
        trace,
        submittedHash,
        "ethereum",
        "Submitted governance vote transaction"
      );
      expect(addMiradorSafeTxHintMock).not.toHaveBeenCalled();
    });

    it("routes a submission-only safe hash through the safe hint", () => {
      attachMiradorTransactionArtifacts(trace, {
        chainId: 1,
        submittedTxHash: submittedHash,
        submittedTxType: "safe",
        submittedTxDetails: "Submitted Safe governance vote transaction",
      });

      expect(addMiradorSafeTxHintMock).toHaveBeenCalledTimes(1);
      expect(addMiradorSafeTxHintMock).toHaveBeenCalledWith(
        trace,
        submittedHash,
        "ethereum",
        "Submitted Safe governance vote transaction"
      );
      expect(addMiradorTxHintMock).not.toHaveBeenCalled();
    });

    it("attaches both hints for a Safe submission resolved to a different hash", () => {
      attachMiradorTransactionArtifacts(trace, {
        chainId: 1,
        submittedTxHash: submittedHash,
        submittedTxType: "safe",
        submittedTxDetails: "Submitted Safe governance vote transaction",
        txHash: resolvedHash,
        txDetails: "Governance vote transaction",
      });

      expect(addMiradorSafeTxHintMock).toHaveBeenCalledWith(
        trace,
        submittedHash,
        "ethereum",
        "Submitted Safe governance vote transaction"
      );
      expect(addMiradorTxHintMock).toHaveBeenCalledWith(
        trace,
        resolvedHash,
        "ethereum",
        "Governance vote transaction"
      );
    });

    it("skips the submitted hint but keeps the resolved hint when both hashes are equal — callers must not re-attach after a submission-time call", () => {
      attachMiradorTransactionArtifacts(trace, {
        chainId: 1,
        submittedTxHash: submittedHash,
        submittedTxDetails: "Submitted governance vote transaction",
        txHash: submittedHash,
        txDetails: "Governance vote transaction",
      });

      expect(addMiradorSafeTxHintMock).not.toHaveBeenCalled();
      expect(addMiradorTxHintMock).toHaveBeenCalledTimes(1);
      expect(addMiradorTxHintMock).toHaveBeenCalledWith(
        trace,
        submittedHash,
        "ethereum",
        "Governance vote transaction"
      );
    });

    it("attaches input data only when provided", () => {
      attachMiradorTransactionArtifacts(trace, {
        chainId: 1,
        inputData: "0x1234",
      });
      expect(addMiradorTxInputDataMock).toHaveBeenCalledWith(trace, "0x1234");

      addMiradorTxInputDataMock.mockClear();
      attachMiradorTransactionArtifacts(trace, {
        chainId: 1,
        submittedTxHash: submittedHash,
      });
      expect(addMiradorTxInputDataMock).not.toHaveBeenCalled();
    });

    it("attaches no hints when the chain cannot be mapped", () => {
      attachMiradorTransactionArtifacts(trace, {
        chainId: 999999,
        submittedTxHash: submittedHash,
        txHash: resolvedHash,
      });

      expect(addMiradorTxHintMock).not.toHaveBeenCalled();
      expect(addMiradorSafeTxHintMock).not.toHaveBeenCalled();
    });
  });
});
