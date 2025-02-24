import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import GovernorSettingsParams from "../components/GovernorSettingsParams";
import { useReadContract } from "wagmi";
import Tenant from "@/lib/tenant/tenant";

vi.mock("wagmi", () => ({
  useReadContract: vi.fn(),
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
        data: BigInt(100),
        isFetched: true,
      } as any)
      .mockReturnValueOnce({
        data: BigInt(1000),
        isFetched: true,
      } as any)
      .mockReturnValueOnce({
        data: BigInt(3600),
        isFetched: true,
      } as any);

    render(<GovernorSettingsParams />);

    expect(screen.getByText("Voting Delay")).toBeInTheDocument();
    expect(screen.getByText("Voting Period")).toBeInTheDocument();
    expect(screen.getByText("Timelock Delay")).toBeInTheDocument();
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
