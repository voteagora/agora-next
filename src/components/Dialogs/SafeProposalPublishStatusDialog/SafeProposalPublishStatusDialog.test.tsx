import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SafeProposalPublishStatusDialog } from "./SafeProposalPublishStatusDialog";

const { useSafeMultisigTransactionStatusMock, useSafeOwnersAndThresholdMock } =
  vi.hoisted(() => ({
    useSafeMultisigTransactionStatusMock: vi.fn(),
    useSafeOwnersAndThresholdMock: vi.fn(),
  }));
const { isSafeOnchainTransactionTrackingEnabledMock } = vi.hoisted(() => ({
  isSafeOnchainTransactionTrackingEnabledMock: vi.fn(() => true),
}));

vi.mock("@/components/Button", () => ({
  UpdatedButton: ({ children, href, fullWidth: _fullWidth, ...props }: any) =>
    href ? (
      <a href={href} {...props}>
        {children}
      </a>
    ) : (
      <button {...props}>{children}</button>
    ),
}));

vi.mock("@/hooks/useSafeMultisigTransactionStatus", () => ({
  useSafeMultisigTransactionStatus: useSafeMultisigTransactionStatusMock,
}));

vi.mock("@/hooks/useSafeOwnersAndThreshold", () => ({
  useSafeOwnersAndThreshold: useSafeOwnersAndThresholdMock,
}));

vi.mock("@/lib/safeFeatures", () => ({
  isSafeOnchainTransactionTrackingEnabled:
    isSafeOnchainTransactionTrackingEnabledMock,
  SAFE_ONCHAIN_TRANSACTION_TRACKING_DISABLED_MESSAGE:
    "Safe onchain transaction tracking is disabled for this tenant.",
}));

vi.mock("@/lib/utils", () => ({
  getBlockScanUrl: vi.fn(() => "https://example.com/tx"),
}));

describe("SafeProposalPublishStatusDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isSafeOnchainTransactionTrackingEnabledMock.mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders a terminal removed state when the Safe transaction disappears from the queue", () => {
    useSafeMultisigTransactionStatusMock.mockReturnValue({
      data: {
        found: false,
        status: null,
        isSuccessful: null,
        nextPollMs: 30_000,
        missingReason: "removed",
      },
      isLoading: false,
      isFetching: false,
    });
    useSafeOwnersAndThresholdMock.mockReturnValue({
      data: null,
      isError: false,
    });

    render(
      <SafeProposalPublishStatusDialog
        closeDialog={vi.fn()}
        publish={{
          kind: "publish_proposal",
          safeAddress: "0x1234567890123456789012345678901234567890",
          chainId: 1,
          safeTxHash:
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          createdAt: "2026-03-12T00:00:00.000Z",
        }}
      />
    );

    expect(screen.getByText("Safe transaction removed")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This Safe transaction was removed from the queue before execution. It will not collect more signatures or execute."
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Open Safe/i })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    expect(screen.queryByText("Keep In Background")).not.toBeInTheDocument();
  });

  it("renders a direct Safe fallback when onchain tracking is disabled", () => {
    isSafeOnchainTransactionTrackingEnabledMock.mockReturnValue(false);
    useSafeMultisigTransactionStatusMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
    });
    useSafeOwnersAndThresholdMock.mockReturnValue({
      data: null,
      isError: false,
    });

    render(
      <SafeProposalPublishStatusDialog
        closeDialog={vi.fn()}
        publish={{
          kind: "publish_proposal",
          safeAddress: "0x1234567890123456789012345678901234567890",
          chainId: 1,
          safeTxHash:
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          createdAt: "2026-03-12T00:00:00.000Z",
        }}
      />
    );

    expect(screen.getByText("Safe transaction created")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Safe onchain transaction tracking is disabled for this tenant\./i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Open Safe/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });
});
