import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  startOrResumeProposalCreationTraceMock,
  startOrResumeSiweLoginTraceMock,
} = vi.hoisted(() => ({
  startOrResumeProposalCreationTraceMock: vi.fn(),
  startOrResumeSiweLoginTraceMock: vi.fn(),
}));

vi.mock("@/lib/mirador/proposalCreationTrace", () => ({
  startOrResumeProposalCreationTrace: startOrResumeProposalCreationTraceMock,
}));

vi.mock("@/lib/mirador/siweLoginTrace", () => ({
  startOrResumeSiweLoginTrace: startOrResumeSiweLoginTraceMock,
}));

import {
  getSafeMessageHintDetails,
  resolveTraceForSafeMessageHint,
} from "@/lib/mirador/safeMessageHint";

const WALLET_ADDRESS = "0x1111111111111111111111111111111111111111" as const;

describe("resolveTraceForSafeMessageHint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resumes the proposal creation trace for proposal drafts", () => {
    const trace = { id: "proposal-trace" };
    startOrResumeProposalCreationTraceMock.mockReturnValue(trace);

    expect(
      resolveTraceForSafeMessageHint({
        purpose: "proposal_draft",
        walletAddress: WALLET_ADDRESS,
        chainId: 1,
      })
    ).toBe(trace);

    expect(startOrResumeProposalCreationTraceMock).toHaveBeenCalledWith({
      walletAddress: WALLET_ADDRESS,
      chainId: 1,
    });
    expect(startOrResumeSiweLoginTraceMock).not.toHaveBeenCalled();
  });

  it.each(["notification_preferences", "delegate_statement"] as const)(
    "resumes the SIWE login trace for %s",
    (purpose) => {
      const trace = { id: "siwe-trace" };
      startOrResumeSiweLoginTraceMock.mockReturnValue(trace);

      expect(
        resolveTraceForSafeMessageHint({
          purpose,
          walletAddress: WALLET_ADDRESS,
          chainId: 1,
        })
      ).toBe(trace);

      expect(startOrResumeSiweLoginTraceMock).toHaveBeenCalledWith({
        purpose,
        walletAddress: WALLET_ADDRESS,
        chainId: 1,
      });
      expect(startOrResumeProposalCreationTraceMock).not.toHaveBeenCalled();
    }
  );
});

describe("getSafeMessageHintDetails", () => {
  it.each([
    ["proposal_draft", "siwe", "Create proposal SIWE"],
    ["proposal_draft", "raw_message", "Create proposal Safe message"],
    ["notification_preferences", "siwe", "Notification preferences SIWE"],
    [
      "notification_preferences",
      "raw_message",
      "Notification preferences Safe message",
    ],
    ["delegate_statement", "siwe", "Delegate statement SIWE"],
    ["delegate_statement", "raw_message", "Delegate statement Safe message"],
  ] as const)("labels %s/%s as %s", (purpose, signingKind, expected) => {
    expect(getSafeMessageHintDetails({ purpose, signingKind })).toBe(expected);
  });

  it("returns undefined without a recognized purpose", () => {
    expect(
      getSafeMessageHintDetails({ purpose: undefined, signingKind: "siwe" })
    ).toBeUndefined();
  });
});
