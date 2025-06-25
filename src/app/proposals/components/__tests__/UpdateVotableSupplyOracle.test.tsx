import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi, afterEach } from "vitest";
import { UpdateVotableSupplyOracle } from "@/app/proposals/components/UpdateVotableSupplyOracle";
import * as wagmi from "wagmi";
import * as tanstackQuery from "@tanstack/react-query";
import * as useGetVotableSupplyHook from "@/hooks/useGetVotableSupply";
import {
  UseWaitForTransactionReceiptReturnType,
  UseAccountReturnType,
  UseReadContractReturnType,
  UseWriteContractReturnType,
} from "wagmi";
import { QueryClient } from "@tanstack/react-query";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { IVotableSupplyOracleContract } from "@/lib/contracts/common/interfaces/IVotableSupplyOracleContract";
import { optimism } from "viem/chains";

vi.mock("wagmi");
vi.mock("@tanstack/react-query");
vi.mock("@/hooks/useGetVotableSupply");

vi.mock("@/components/Button", () => ({
  OldButton: vi.fn(({ children, ...props }) => (
    <button data-testid="update-supply-button" {...props}>
      {children}
    </button>
  )),
}));

// Mock utilities
vi.mock("@/lib/utils", () => ({
  formatNumber: vi.fn((val) => val.toString()),
  cn: vi.fn(() => "cn"), // this is used in button component
}));

const mockVotableSupplyOracleData =
  new TenantContract<IVotableSupplyOracleContract>({
    address: "0xvotablesupplyoracle" as `0x${string}`,
    abi: [],
    chain: optimism,
    contract: {
      votableSupply: vi
        .fn()
        .mockImplementation(() => BigInt("116799799048035407924717724")),
      owner: vi.fn().mockImplementation(() => "0x123"),
      _updateVotableSupply: vi.fn(),
      "votableSupply()": vi
        .fn()
        .mockImplementation(() => BigInt("116799799048035407924717724")),
    } as unknown as IVotableSupplyOracleContract,
    provider: {} as any,
  });

describe("UpdateVotableSupplyOracle", () => {
  // Setup common mocks
  const mockUseAccount = vi.spyOn(wagmi, "useAccount");
  const mockUseReadContract = vi.spyOn(wagmi, "useReadContract");
  const mockUseWriteContract = vi.spyOn(wagmi, "useWriteContract");
  const mockUseWaitForTransactionReceipt = vi.spyOn(
    wagmi,
    "useWaitForTransactionReceipt"
  );
  const mockUseGetVotableSupply = vi.spyOn(
    useGetVotableSupplyHook,
    "useGetVotableSupply"
  );
  const mockUseQueryClient = vi.spyOn(tanstackQuery, "useQueryClient");

  // Mock data
  const mockAddress = "0x123" as `0x${string}`;
  const mockOwnerAddress = "0x123" as `0x${string}`;
  const mockPresentVotableSupply = "116799850939014514601948447";
  const mockVotableSupplyOracleValue = "116799799048035407924717724";
  const mockTxHash = "0xabc" as `0x${string}`;
  const mockQueryClient = {
    invalidateQueries: vi.fn(),
  } as unknown as QueryClient;
  const mockRefetch = vi.fn();
  const mockWriteContractAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAccount.mockReturnValue({
      address: mockAddress,
    } as UseAccountReturnType);

    // Fix the useReadContract mock implementation
    mockUseReadContract.mockImplementation((params: any) => {
      // Access functionName safely with type assertion
      const functionName = params?.functionName;

      if (functionName === "votableSupply") {
        return {
          data: mockVotableSupplyOracleValue,
          refetch: mockRefetch,
        } as unknown as UseReadContractReturnType<any, any>;
      }
      if (functionName === "owner") {
        return {
          data: mockOwnerAddress,
        } as unknown as UseReadContractReturnType<any, any>;
      }
      return {} as UseReadContractReturnType<any, any>;
    });

    mockUseWriteContract.mockReturnValue({
      writeContractAsync: mockWriteContractAsync,
      isPending: false,
    } as unknown as UseWriteContractReturnType<any>);

    mockUseWaitForTransactionReceipt.mockReturnValue({
      isSuccess: false,
      data: undefined,
    } as UseWaitForTransactionReceiptReturnType<any, any, any>);

    mockUseGetVotableSupply.mockReturnValue({
      data: mockPresentVotableSupply,
    } as unknown as ReturnType<
      typeof useGetVotableSupplyHook.useGetVotableSupply
    >);

    mockUseQueryClient.mockReturnValue(mockQueryClient);

    mockWriteContractAsync.mockResolvedValue(mockTxHash);
  });

  afterEach(() => {
    cleanup();
  });

  test("renders correctly with data", () => {
    render(
      <UpdateVotableSupplyOracle
        votableSupplyOracle={mockVotableSupplyOracleData}
        tokenDecimal={18}
      />
    );

    // Check if the component renders the formatted supply values
    expect(screen.getByText(/Current votable supply:/)).toBeDefined();
    expect(screen.getByText(/Current value in oracle:/)).toBeDefined();
    expect(screen.getByText("Update Votable Supply")).toBeDefined();
  });

  test("does not render if user is not the owner", () => {
    mockUseAccount.mockReturnValue({
      address: "0x456" as `0x${string}`, // Different from owner
    } as UseAccountReturnType);

    const { container } = render(
      <UpdateVotableSupplyOracle
        votableSupplyOracle={mockVotableSupplyOracleData}
        tokenDecimal={18}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test("handles update supply correctly", async () => {
    render(
      <UpdateVotableSupplyOracle
        votableSupplyOracle={mockVotableSupplyOracleData}
        tokenDecimal={18}
      />
    );

    // Click the update button using testId instead of text
    fireEvent.click(screen.getByTestId("update-supply-button"));

    // Check if writeContractAsync was called with correct arguments
    expect(mockWriteContractAsync).toHaveBeenCalledWith({
      address: "0xvotablesupplyoracle",
      abi: [],
      functionName: "_updateVotableSupply",
      args: [BigInt(mockPresentVotableSupply)],
      chainId: optimism.id,
    });
  });

  test("shows loading state during update", () => {
    mockUseWriteContract.mockReturnValue({
      writeContractAsync: mockWriteContractAsync,
      isPending: true,
    } as unknown as UseWriteContractReturnType<any>);

    render(
      <UpdateVotableSupplyOracle
        votableSupplyOracle={mockVotableSupplyOracleData}
        tokenDecimal={18}
      />
    );

    // Check if the button shows loading state using testId
    const button = screen.getByTestId("update-supply-button");
    expect(button).toHaveTextContent("Updating...");
    expect(button).toHaveProperty("disabled", true);
  });

  test("refreshes data after transaction confirmation", async () => {
    const { rerender } = render(
      <UpdateVotableSupplyOracle
        votableSupplyOracle={mockVotableSupplyOracleData}
        tokenDecimal={18}
      />
    );

    // Simulate transaction confirmation with type assertion
    mockUseWaitForTransactionReceipt.mockReturnValue({
      isSuccess: true,
      data: { transactionHash: mockTxHash },
    } as UseWaitForTransactionReceiptReturnType<any, any, any>);

    // Re-render with confirmed transaction
    rerender(
      <UpdateVotableSupplyOracle
        votableSupplyOracle={mockVotableSupplyOracleData}
        tokenDecimal={18}
      />
    );

    // Check if data was refreshed
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [useGetVotableSupplyHook.VOTABLE_SUPPLY_QK],
    });
    expect(mockRefetch).toHaveBeenCalled();
  });
});
