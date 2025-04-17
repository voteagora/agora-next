import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import GovernorSettingsParams from "../components/GovernorSettingsParams";
import { useReadContract } from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { blocksToSeconds } from "@/lib/blockTimes";

vi.mock("wagmi", () => ({
  useReadContract: vi.fn(),
}));

vi.mock("@/lib/blockTimes", () => ({
  blocksToSeconds: vi.fn(),
}));

vi.mock("@/lib/tenant/tenant", () => {
  return {
    default: {
      current: vi.fn().mockImplementation(() => ({
        contracts: {
          token: {
            chain: {
              id: 1,
            },
          },
          governor: {
            chain: {
              id: 1,
            },
            address: "0x123",
          },
          timelock: {
            chain: {
              id: 1,
            },
            address: "0x456",
          },
        },
        ui: {
          toggle: vi.fn(),
        },
      })),
    },
  };
});

describe("GovernorSettingsParams", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(blocksToSeconds).mockImplementation((blocks) => blocks * 12); // Mock 12 seconds per block
  });

  afterEach(() => {
    cleanup();
  });

  it("renders loading state initially", () => {
    vi.mocked(useReadContract)
      .mockReturnValueOnce({
        data: undefined,
        isFetched: false,
      } as any)
      .mockReturnValueOnce({
        data: undefined,
        isFetched: false,
      } as any)
      .mockReturnValueOnce({
        data: undefined,
        isFetched: false,
      } as any);

    render(<GovernorSettingsParams />);

    const loadingElements = screen.getAllByText("Loading...");
    expect(loadingElements).toHaveLength(3);
  });

  it("displays correct voting parameters when data is loaded", () => {
    vi.mocked(useReadContract)
      .mockReturnValueOnce({
        data: BigInt(300),
        isFetched: true,
      } as any)
      .mockReturnValueOnce({
        data: BigInt(7200),
        isFetched: true,
      } as any)
      .mockReturnValueOnce({
        data: BigInt(172800),
        isFetched: true,
      } as any);

    render(<GovernorSettingsParams />);

    expect(screen.getByText("Voting Delay")).toBeInTheDocument();
    expect(screen.getByText("1 hour")).toBeInTheDocument();
    expect(screen.getByText("Voting Period")).toBeInTheDocument();
    expect(screen.getByText("1 day")).toBeInTheDocument();
    expect(screen.getByText("Timelock Delay")).toBeInTheDocument();
    expect(screen.getByText("2 days")).toBeInTheDocument();
  });

  it("displays mixed days and hours correctly", () => {
    vi.mocked(useReadContract)
      .mockReturnValueOnce({
        data: BigInt(9000), //9000 blocks voting period (108000 seconds = 1 day, 6 hours)
        isFetched: true,
      } as any)
      .mockReturnValueOnce({
        data: BigInt(175 * 3600), //175 * 3600 seconds timelock delay (175 hours = 7 days, 7 hours)
        isFetched: true,
      } as any)
      .mockReturnValueOnce({
        data: BigInt(175 * 3600),
        isFetched: true,
      } as any);

    render(<GovernorSettingsParams />);

    expect(screen.getAllByText("1 day, 6 hours")).toHaveLength(2);
    expect(screen.getByText("7 days, 7 hours")).toBeInTheDocument();
  });

  it("displays hours and minutes correctly for partial hours", () => {
    vi.mocked(useReadContract)
      .mockReturnValueOnce({
        data: BigInt(2520), //2520 blocks voting delay (30240 seconds = 8 hours, 24 minutes)
        isFetched: true,
      } as any)
      .mockReturnValueOnce({
        data: BigInt(7200),
        isFetched: true,
      } as any)
      .mockReturnValueOnce({
        data: BigInt(3600 * 8 + 1800), // 8 hours and 30 minutes
        isFetched: true,
      } as any);

    render(<GovernorSettingsParams />);

    expect(screen.getByText("8 hours, 24 minutes")).toBeInTheDocument();
    expect(screen.getByText("1 day")).toBeInTheDocument();
    expect(screen.getByText("8 hours, 30 minutes")).toBeInTheDocument();
  });

  it("renders without timelock when not configured", () => {
    const mockCurrent = vi.mocked(Tenant.current);
    mockCurrent.mockImplementation(
      () =>
        ({
          contracts: {
            token: {
              chain: {
                id: 1,
              },
            },
            governor: {
              chain: {
                id: 1,
              },
              address: "0x123",
            },
          },
          ui: {
            toggle: vi.fn(),
          },
        }) as any
    );

    vi.mocked(useReadContract)
      .mockReturnValueOnce({
        data: BigInt(100),
        isFetched: true,
      } as any)
      .mockReturnValueOnce({
        data: BigInt(1000),
        isFetched: true,
      } as any)
      .mockReturnValueOnce({
        data: undefined,
        isFetched: false,
      } as any);

    render(<GovernorSettingsParams />);

    expect(screen.queryByText("Timelock Delay")).not.toBeInTheDocument();
  });
});
