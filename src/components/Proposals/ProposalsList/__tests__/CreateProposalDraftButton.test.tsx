import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import CreateProposalDraftButton from "../CreateProposalDraftButton";
import { useGetVotes } from "@/hooks/useGetVotes";
import { useManager } from "@/hooks/useManager";
import { useProposalThreshold } from "@/hooks/useProposalThreshold";
import { UseQueryResult } from "@tanstack/react-query";

vi.mock("@/components/Button", () => ({
  UpdatedButton: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
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
});

vi.mock("@/hooks/useGetVotes");
vi.mock("@/hooks/useManager");
vi.mock("@/hooks/useProposalThreshold");

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

    render(<CreateProposalDraftButton address={mockAddress} />);

    expect(screen.getByText("Create proposal")).toBeInTheDocument();
  });

  it("renders button when user meets threshold", () => {
    vi.mocked(useManager).mockReturnValue(createMockQueryResult("0xdifferent"));
    vi.mocked(useGetVotes).mockReturnValue(createMockQueryResult(150n));
    vi.mocked(useProposalThreshold).mockReturnValue(
      createMockQueryResult(100n)
    );

    render(<CreateProposalDraftButton address={mockAddress} />);

    expect(screen.getByText("Create proposal")).toBeInTheDocument();
  });

  it("does not render button when user is not manager and does not meet threshold", () => {
    vi.mocked(useManager).mockReturnValue(createMockQueryResult("0xdifferent"));
    vi.mocked(useGetVotes).mockReturnValue(createMockQueryResult(0n));
    vi.mocked(useProposalThreshold).mockReturnValue(
      createMockQueryResult(150n)
    );

    render(<CreateProposalDraftButton address={mockAddress} />);

    expect(screen.queryByText("Create proposal")).not.toBeInTheDocument();
  });

  it("renders button when protocol level check is disabled", () => {
    mockConfig.protocolLevelCreateProposalButtonCheck = false;

    vi.mocked(useManager).mockReturnValue(createMockQueryResult("0xdifferent"));
    vi.mocked(useGetVotes).mockReturnValue(createMockQueryResult(0n));
    vi.mocked(useProposalThreshold).mockReturnValue(
      createMockQueryResult(100n)
    );

    render(<CreateProposalDraftButton address={mockAddress} />);

    expect(screen.getByText("Create proposal")).toBeInTheDocument();
  });
});
