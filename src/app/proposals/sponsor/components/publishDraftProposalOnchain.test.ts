import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProposalScope } from "@/app/proposals/draft/types";
import { handleDraftOnchainPublishResult } from "@/app/proposals/sponsor/components/publishDraftProposalOnchain";

const {
  sponsorDraftProposalMock,
  closeStoredProposalCreationTraceMock,
  getProposalCreationTraceContextMock,
  trackEventMock,
  isSafeOnchainTransactionTrackingEnabledMock,
} = vi.hoisted(() => ({
  sponsorDraftProposalMock: vi.fn(),
  closeStoredProposalCreationTraceMock: vi.fn(),
  getProposalCreationTraceContextMock: vi.fn(() => undefined),
  trackEventMock: vi.fn(),
  isSafeOnchainTransactionTrackingEnabledMock: vi.fn(() => true),
}));

vi.mock("../../draft/actions/sponsorDraftProposal", () => ({
  onSubmitAction: sponsorDraftProposalMock,
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: trackEventMock,
}));

vi.mock("@/lib/mirador/proposalCreationTrace", () => ({
  closeStoredProposalCreationTrace: closeStoredProposalCreationTraceMock,
  getProposalCreationTraceContext: getProposalCreationTraceContextMock,
  persistProposalCreationTraceState: vi.fn(),
  startFreshProposalCreationTrace: vi.fn(),
  startOrResumeProposalCreationTrace: vi.fn(),
}));

vi.mock("@/lib/mirador/webTrace", () => ({
  addMiradorEvent: vi.fn(),
  addMiradorTxHint: vi.fn(),
  addMiradorTxInputData: vi.fn(),
  flushMiradorTrace: vi.fn(),
}));

vi.mock("@/lib/mirador/chains", () => ({
  getMiradorChainNameFromChainId: vi.fn(),
}));

vi.mock("@/lib/utils", () => ({
  resolveSafeTx: vi.fn(),
}));

vi.mock("@/lib/safeFeatures", () => ({
  isSafeOnchainTransactionTrackingEnabled:
    isSafeOnchainTransactionTrackingEnabledMock,
}));

describe("handleDraftOnchainPublishResult", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isSafeOnchainTransactionTrackingEnabledMock.mockReturnValue(true);
  });

  it("opens the Safe publish dialog without waiting for trace closure", async () => {
    closeStoredProposalCreationTraceMock.mockImplementation(
      () => new Promise(() => {})
    );
    sponsorDraftProposalMock.mockResolvedValue({
      ok: true,
      safeProposalPublish: {
        kind: "publish_proposal",
        safeAddress: "0x1234567890123456789012345678901234567890",
        chainId: 1,
        safeTxHash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        createdAt: "2026-03-12T00:00:00.000Z",
      },
    });

    const openDialog = vi.fn();

    await expect(
      handleDraftOnchainPublishResult({
        address: "0x1234567890123456789012345678901234567890",
        chainId: 1,
        draftProposal: {
          id: 42,
          proposal_scope: ProposalScope.ONCHAIN,
        } as any,
        inputData: [],
        txHash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        isSafeWallet: true,
        getAuthenticationData: vi.fn().mockResolvedValue({
          jwt: "jwt-token",
        }),
        openDialog,
      })
    ).resolves.toBeUndefined();

    expect(openDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "SAFE_PROPOSAL_PUBLISH_STATUS",
        params: expect.objectContaining({
          publish: expect.objectContaining({
            safeTxHash:
              "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          }),
        }),
      })
    );
    expect(closeStoredProposalCreationTraceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "draft_onchain_safe_tx_handed_off",
      })
    );
  });

  it("falls back to the generic publish dialog when Safe onchain tracking is disabled", async () => {
    isSafeOnchainTransactionTrackingEnabledMock.mockReturnValue(false);
    sponsorDraftProposalMock.mockResolvedValue({
      ok: true,
      safeProposalPublish: undefined,
    });

    const openDialog = vi.fn();

    await handleDraftOnchainPublishResult({
      address: "0x1234567890123456789012345678901234567890",
      chainId: 1,
      draftProposal: {
        id: 42,
        proposal_scope: ProposalScope.ONCHAIN,
      } as any,
      inputData: [],
      txHash:
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      isSafeWallet: true,
      getAuthenticationData: vi.fn().mockResolvedValue({
        jwt: "jwt-token",
      }),
      openDialog,
    });

    expect(sponsorDraftProposalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        safeAddress: undefined,
      })
    );
    expect(openDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "SPONSOR_ONCHAIN_DRAFT_PROPOSAL",
      })
    );
    expect(closeStoredProposalCreationTraceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "draft_onchain_safe_tracking_disabled",
      })
    );
  });
});
