import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import CreateProposalDraftButton from "../CreateProposalDraftButton";
import { useGetVotes } from "@/hooks/useGetVotes";
import { useManager } from "@/hooks/useManager";
import { useProposalThreshold } from "@/hooks/useProposalThreshold";
import { UseQueryResult } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

const createMockQueryResult = (data: any): UseQueryResult<any, Error> => ({
  data,
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
  isEnabled: true,
});

vi.mock("@/hooks/useGetVotes");
vi.mock("@/hooks/useManager");
vi.mock("@/hooks/useProposalThreshold");
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

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      ui: {
        toggle: () => ({
          config: mockConfig,
        }),
      },
    }),
  },
}));

describe("CreateProposalDraftButton", () => {
  const mockAddress = "0x123" as `0x${string}`;

  beforeEach(() => {
    vi.clearAllMocks();
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
});
