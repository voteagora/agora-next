import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import { SafeProposalChoiceDialog } from "./SafeProposalChoiceDialog";
import {
  markProposalCreationBranch,
  startOrResumeProposalCreationTrace,
} from "@/lib/mirador/proposalCreationTrace";
import { addMiradorEvent } from "@/lib/mirador/webTrace";
import { UNSUPPORTED_SAFE_PROPOSAL_FLOW_MESSAGE } from "@/lib/safeChains";
import { clearStoredSafeOffchainSigningState } from "@/lib/safeOffchainFlow";
import { getStoredSiweJwt } from "@/lib/siweSession";

const {
  openDialogMock,
  pushMock,
  signInMock,
  toastMock,
  waitForStoredSiweJwtMock,
} = vi.hoisted(() => ({
  openDialogMock: vi.fn(),
  pushMock: vi.fn(),
  signInMock: vi.fn(),
  toastMock: vi.fn(),
  waitForStoredSiweJwtMock: vi.fn(),
}));
const { isSafeOffchainMessageTrackingEnabledMock } = vi.hoisted(() => ({
  isSafeOffchainMessageTrackingEnabledMock: vi.fn(() => true),
}));
const closeDialogMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("connectkit", () => ({
  useSIWE: () => ({
    signIn: signInMock,
  }),
}));

vi.mock("react-hot-toast", () => ({
  default: toastMock,
}));

vi.mock("@/components/Button", () => ({
  UpdatedButton: ({ children, isLoading: _isLoading, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/Dialogs/DialogProvider/DialogProvider", () => ({
  useOpenDialog: () => openDialogMock,
}));

vi.mock("@/lib/mirador/proposalCreationTrace", () => ({
  clearStoredProposalCreationTraceState: vi.fn(),
  closeStoredProposalCreationTrace: vi.fn(),
  markProposalCreationBranch: vi.fn().mockResolvedValue(null),
  startOrResumeProposalCreationTrace: vi.fn(() => ({
    getTraceId: vi.fn(() => "trace-id"),
  })),
}));

vi.mock("@/lib/mirador/webTrace", () => ({
  addMiradorEvent: vi.fn(),
  flushMiradorTrace: vi.fn(),
}));

vi.mock("@/lib/safeOffchainFlow", () => ({
  clearStoredSafeOffchainSigningState: vi.fn(),
}));

vi.mock("@/lib/siweSession", () => ({
  getStoredSiweJwt: vi.fn(),
  waitForStoredSiweJwt: waitForStoredSiweJwtMock,
}));

vi.mock("@/lib/safeFeatures", () => ({
  isSafeOffchainMessageTrackingEnabled:
    isSafeOffchainMessageTrackingEnabledMock,
  SAFE_OFFCHAIN_MESSAGE_TRACKING_DISABLED_MESSAGE:
    "Safe offchain message tracking is disabled for this tenant.",
}));

describe("SafeProposalChoiceDialog", () => {
  const safeAddress = "0x1234567890abcdef1234567890abcdef12345678" as const;

  beforeEach(() => {
    vi.clearAllMocks();
    isSafeOffchainMessageTrackingEnabledMock.mockReturnValue(true);
    signInMock.mockResolvedValue(true);
    waitForStoredSiweJwtMock.mockResolvedValue("jwt-token");
  });

  afterEach(() => {
    cleanup();
  });

  it("reuses an existing SIWE JWT while keeping the proposal trace active", async () => {
    const onAuthenticated = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getStoredSiweJwt).mockReturnValue("jwt-token");

    render(
      <SafeProposalChoiceDialog
        closeDialog={closeDialogMock}
        safeAddress={safeAddress}
        chainId={1}
        isSafeWallet
        onAuthenticated={onAuthenticated}
      />
    );

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(
      screen.getByRole("button", { name: "Create Draft Offchain" })
    );

    await waitFor(() => {
      expect(onAuthenticated).toHaveBeenCalledWith("jwt-token");
    });

    expect(startOrResumeProposalCreationTrace).toHaveBeenCalledWith({
      walletAddress: safeAddress,
      chainId: 1,
    });
    expect(markProposalCreationBranch).toHaveBeenCalledWith(
      "safe_offchain_draft",
      expect.any(Object),
      expect.objectContaining({
        walletAddress: safeAddress,
        chainId: 1,
        safeAddress,
      })
    );
    expect(addMiradorEvent).toHaveBeenNthCalledWith(
      2,
      expect.any(Object),
      "siwe_session_reused"
    );
    expect(clearStoredSafeOffchainSigningState).toHaveBeenCalled();
    expect(closeDialogMock).toHaveBeenCalled();
    expect(openDialogMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
    expect(toastMock).not.toHaveBeenCalled();
  });

  it("opens the Safe signing flow when no SIWE JWT exists", async () => {
    const onAuthenticated = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getStoredSiweJwt).mockReturnValue(null);

    render(
      <SafeProposalChoiceDialog
        closeDialog={closeDialogMock}
        safeAddress={safeAddress}
        chainId={1}
        isSafeWallet
        onAuthenticated={onAuthenticated}
      />
    );

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(
      screen.getByRole("button", { name: "Create Draft Offchain" })
    );

    await waitFor(() => {
      expect(startOrResumeProposalCreationTrace).toHaveBeenCalledWith({
        walletAddress: safeAddress,
        chainId: 1,
      });
      expect(markProposalCreationBranch).toHaveBeenCalledWith(
        "safe_offchain_draft",
        expect.any(Object),
        expect.objectContaining({
          walletAddress: safeAddress,
          chainId: 1,
          safeAddress,
        })
      );
      expect(openDialogMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "SAFE_OFFCHAIN_SIGNING",
          params: expect.objectContaining({
            safeAddress,
            chainId: 1,
            purpose: "proposal_draft",
            signingKind: "siwe",
            onAuthenticated,
            secondaryAction: expect.objectContaining({
              label: "Go Direct Onchain",
              onAction: expect.any(Function),
            }),
          }),
        })
      );
    });

    expect(onAuthenticated).not.toHaveBeenCalled();
    expect(clearStoredSafeOffchainSigningState).toHaveBeenCalled();
    expect(closeDialogMock).not.toHaveBeenCalled();
  });

  it("disables Safe proposal actions on unsupported tx-service chains", () => {
    render(
      <SafeProposalChoiceDialog
        closeDialog={closeDialogMock}
        safeAddress={safeAddress}
        chainId={59141}
        isSafeWallet
        onAuthenticated={vi.fn()}
      />
    );

    expect(screen.getByText("Unsupported Chain")).toBeInTheDocument();
    expect(
      screen.getByText(UNSUPPORTED_SAFE_PROPOSAL_FLOW_MESSAGE)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", {
        name: "I understand the Safe draft signing flow requirements",
      })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Draft Offchain" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Skip & Go Direct to Onchain" })
    ).toBeDisabled();
  });

  it("keeps Safe draft creation available without tracked signer UX when offchain tracking is turned off", async () => {
    isSafeOffchainMessageTrackingEnabledMock.mockReturnValue(false);
    const onAuthenticated = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getStoredSiweJwt).mockReturnValue(null);

    render(
      <SafeProposalChoiceDialog
        closeDialog={closeDialogMock}
        safeAddress={safeAddress}
        chainId={1}
        isSafeWallet
        onAuthenticated={onAuthenticated}
      />
    );

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(
      screen.getByRole("button", { name: "Create Draft Offchain" })
    );

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledTimes(1);
      expect(waitForStoredSiweJwtMock).toHaveBeenCalledWith({
        expectedAddress: safeAddress,
      });
      expect(onAuthenticated).toHaveBeenCalledWith("jwt-token");
    });

    expect(screen.getByText("Limited Safe Draft Feedback")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Safe offchain message tracking is disabled for this tenant\./i
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(openDialogMock).not.toHaveBeenCalled();
    expect(closeDialogMock).toHaveBeenCalled();
    expect(toastMock).not.toHaveBeenCalled();
  });
});
