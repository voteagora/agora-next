import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import CreateProposalDraftButton from "../CreateProposalDraftButton";
import { useGetVotes } from "@/hooks/useGetVotes";
import { useManager } from "@/hooks/useManager";
import { useProposalThreshold } from "@/hooks/useProposalThreshold";
import { UseQueryResult } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  persistProposalCreationTraceState,
  startFreshProposalCreationTrace,
  startOrResumeProposalCreationTrace,
} from "@/lib/mirador/proposalCreationTrace";
import { getStoredSiweJwt } from "@/lib/siweSession";
import { isSafeWallet } from "@/lib/utils";

const openDialogMock = vi.fn();

// Mock Next.js App Router (next/navigation) to avoid "expected app router to be mounted"
vi.mock("next/navigation", () => {
  const push = vi.fn();
  const replace = vi.fn();
  const prefetch = vi.fn();
  const back = vi.fn();
  return {
    useRouter: () => ({ push, replace, prefetch, back }),
    useSearchParams: () => ({ get: vi.fn() }),
  };
});

vi.mock("@/components/Button", () => ({
  UpdatedButton: ({
    children,
    isLoading,
    ...props
  }: {
    children: React.ReactNode;
    isLoading?: boolean;
  }) => <button {...props}>{children}</button>,
}));

vi.mock("@/components/Dialogs/DialogProvider/DialogProvider", () => ({
  useOpenDialog: () => openDialogMock,
}));

vi.mock("connectkit", () => ({
  useSIWE: () => ({
    signIn: vi.fn(),
  }),
}));

vi.mock("@/lib/mirador/proposalCreationTrace", () => ({
  clearStoredProposalCreationTraceState: vi.fn(),
  closeStoredProposalCreationTrace: vi.fn(),
  getProposalCreationTraceHeaders: vi.fn(() => ({})),
  getStoredProposalCreationTraceState: vi.fn(() => null),
  persistProposalCreationTraceState: vi.fn(),
  startFreshProposalCreationTrace: vi.fn(),
  startOrResumeProposalCreationTrace: vi.fn(),
}));

vi.mock("@/lib/mirador/webTrace", () => ({
  addMiradorEvent: vi.fn(),
  flushMiradorTrace: vi.fn(),
}));

vi.mock("@/lib/siweSession", () => ({
  SIWE_SESSION_CHANGE_EVENT: "agora:siwe-session-change",
  clearStoredSiweSession: vi.fn(),
  getStoredSiweJwt: vi.fn(() => null),
  waitForStoredSiweJwt: vi.fn(),
}));

const createMockQueryResult = (data: any): UseQueryResult<any, Error> => ({
  data,
  isEnabled: true,
  isFetched: true,
  isFetching: false,
  isPending: false,
  isLoading: false,
  isLoadingError: false,
  isRefetchError: false,
  isSuccess: true,
  status: "success",
  dataUpdatedAt: 0,
  error: null,
  isError: false,
  errorUpdatedAt: 0,
  failureCount: 0,
  isRefetching: false,
  errorUpdateCount: 0,
  isFetchedAfterMount: true,
  isInitialLoading: false,
  failureReason: null,
  isPaused: false,
  isPlaceholderData: false,
  isStale: false,
  fetchStatus: "idle",
  refetch: vi.fn(),
  promise: Promise.resolve(data),
});

vi.mock("@/hooks/useGetVotes");
vi.mock("@/hooks/useManager");
vi.mock("@/hooks/useProposalThreshold");
vi.mock("@/lib/utils", () => ({
  isSafeWallet: vi.fn(),
}));
const testWagmiConfig = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <WagmiProvider config={testWagmiConfig}>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </WagmiProvider>
  );

const mockConfig = {
  protocolLevelCreateProposalButtonCheck: true,
};
let mockSafeProposalChoiceEnabled = true;

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      ui: {
        toggle: (name: string) => {
          if (name === "proposal-lifecycle") {
            return {
              config: mockConfig,
            };
          }

          if (name === "safe-proposal-choice") {
            return {
              enabled: mockSafeProposalChoiceEnabled,
            };
          }

          return undefined;
        },
      },
    }),
  },
}));

describe("CreateProposalDraftButton", () => {
  const mockAddress = "0x123" as `0x${string}`;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig.protocolLevelCreateProposalButtonCheck = true;
    mockSafeProposalChoiceEnabled = true;
    vi.mocked(isSafeWallet).mockResolvedValue(false);
    vi.mocked(getStoredSiweJwt).mockReturnValue(null);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders button when user is manager", () => {
    vi.mocked(useManager).mockReturnValue(createMockQueryResult(mockAddress));
    vi.mocked(useGetVotes).mockReturnValue(createMockQueryResult(0n));
    vi.mocked(useProposalThreshold).mockReturnValue(
      createMockQueryResult(100n)
    );

    renderWithProviders(<CreateProposalDraftButton address={mockAddress} />);

    expect(screen.getByText("Create proposal")).toBeInTheDocument();
  });

  it("renders button when user meets threshold", () => {
    vi.mocked(useManager).mockReturnValue(createMockQueryResult("0xdifferent"));
    vi.mocked(useGetVotes).mockReturnValue(createMockQueryResult(150n));
    vi.mocked(useProposalThreshold).mockReturnValue(
      createMockQueryResult(100n)
    );

    renderWithProviders(<CreateProposalDraftButton address={mockAddress} />);

    expect(screen.getByText("Create proposal")).toBeInTheDocument();
  });

  it("does not render button when user is not manager and does not meet threshold", () => {
    vi.mocked(useManager).mockReturnValue(createMockQueryResult("0xdifferent"));
    vi.mocked(useGetVotes).mockReturnValue(createMockQueryResult(0n));
    vi.mocked(useProposalThreshold).mockReturnValue(
      createMockQueryResult(150n)
    );

    renderWithProviders(<CreateProposalDraftButton address={mockAddress} />);

    expect(screen.queryByText("Create proposal")).not.toBeInTheDocument();
  });

  it("renders button when protocol level check is disabled", () => {
    mockConfig.protocolLevelCreateProposalButtonCheck = false;

    vi.mocked(useManager).mockReturnValue(createMockQueryResult("0xdifferent"));
    vi.mocked(useGetVotes).mockReturnValue(createMockQueryResult(0n));
    vi.mocked(useProposalThreshold).mockReturnValue(
      createMockQueryResult(100n)
    );

    renderWithProviders(<CreateProposalDraftButton address={mockAddress} />);

    expect(screen.getByText("Create proposal")).toBeInTheDocument();
  });

  it("opens the proposal choice dialog for non-safe wallets when enabled", async () => {
    vi.mocked(useManager).mockReturnValue(createMockQueryResult(mockAddress));
    vi.mocked(useGetVotes).mockReturnValue(createMockQueryResult(0n));
    vi.mocked(useProposalThreshold).mockReturnValue(
      createMockQueryResult(100n)
    );

    renderWithProviders(<CreateProposalDraftButton address={mockAddress} />);

    fireEvent.click(screen.getByText("Create proposal"));

    await waitFor(() =>
      expect(openDialogMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "SAFE_PROPOSAL_CHOICE",
          params: expect.objectContaining({
            safeAddress: mockAddress,
            isSafeWallet: false,
            onCreateDraftProposal: expect.any(Function),
          }),
        })
      )
    );
  });

  it("starts a proposal trace for safe wallets even when a SIWE JWT already exists", async () => {
    vi.mocked(useManager).mockReturnValue(createMockQueryResult(mockAddress));
    vi.mocked(useGetVotes).mockReturnValue(createMockQueryResult(0n));
    vi.mocked(useProposalThreshold).mockReturnValue(
      createMockQueryResult(100n)
    );
    vi.mocked(isSafeWallet).mockResolvedValue(true);
    vi.mocked(getStoredSiweJwt).mockReturnValue("jwt-token");
    vi.mocked(startFreshProposalCreationTrace).mockReturnValue({
      getTraceId: vi.fn(() => "trace-id"),
    } as never);

    renderWithProviders(<CreateProposalDraftButton address={mockAddress} />);

    fireEvent.click(screen.getByText("Create proposal"));

    await waitFor(() =>
      expect(openDialogMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "SAFE_PROPOSAL_CHOICE",
          params: expect.objectContaining({
            safeAddress: mockAddress,
            isSafeWallet: true,
            onAuthenticated: expect.any(Function),
          }),
        })
      )
    );

    expect(startFreshProposalCreationTrace).toHaveBeenCalledWith({
      walletAddress: mockAddress,
      chainId: undefined,
    });
    expect(startOrResumeProposalCreationTrace).not.toHaveBeenCalled();
    expect(persistProposalCreationTraceState).toHaveBeenCalled();
  });
});
