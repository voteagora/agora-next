import { beforeEach, describe, expect, it, vi } from "vitest";

import { MIRADOR_FLOW } from "@/lib/mirador/constants";

const {
  addMiradorEventMock,
  closeMiradorTraceMock,
  isMiradorFlowTracingEnabledMock,
  startMiradorTraceMock,
} = vi.hoisted(() => ({
  addMiradorEventMock: vi.fn(),
  closeMiradorTraceMock: vi.fn(),
  isMiradorFlowTracingEnabledMock: vi.fn(),
  startMiradorTraceMock: vi.fn(),
}));

vi.mock("@/lib/mirador/config", () => ({
  isMiradorFlowTracingEnabled: isMiradorFlowTracingEnabledMock,
}));

vi.mock("@/lib/mirador/webTrace", () => ({
  addMiradorEvent: addMiradorEventMock,
  addMiradorSafeTxHint: vi.fn(),
  addMiradorTxHint: vi.fn(),
  addMiradorTxInputData: vi.fn(),
  closeMiradorTrace: closeMiradorTraceMock,
  startMiradorTrace: startMiradorTraceMock,
}));

import {
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
});
