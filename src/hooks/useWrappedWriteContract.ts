import { useWriteContract } from "wagmi";
import { useSelectedWallet } from "@/contexts/SelectedWalletContext";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { encodeFunctionData, getAddress } from "viem";

type WriteContractParams = {
  address: `0x${string}`;
  abi: any;
  functionName: string;
  args?: any[];
  dialogClassName?: string;
  onSubmitSafeTransaction?: () => Promise<void>;
};

export function useWrappedWriteContract() {
  const {
    data,
    writeContract,
    writeContractAsync,
    isPending,
    isSuccess,
    error,
    reset,
    isError,
  } = useWriteContract();
  const { isSelectedPrimaryAddress } = useSelectedWallet();
  const openDialog = useOpenDialog();

  // Helper function to handle Safe wallet transactions
  const handleSafeTransaction = (
    address: `0x${string}`,
    abi: any,
    functionName: string,
    args: any[] = [],
    onSubmitSafeTransaction?: () => Promise<void>,
    dialogClassName: string = "sm:w-[512px]"
  ) => {
    const calldata = encodeFunctionData({
      abi,
      functionName,
      args,
    });

    openDialog({
      type: "SAFE_WALLET_CONFIRMATION",
      params: {
        data: calldata,
        address: getAddress(address),
        onSubmitSafeTransaction,
      },
      className: dialogClassName,
    });

    // Return a placeholder hash for async operations
    return "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;
  };

  // Standard write function
  const write = (params: WriteContractParams) => {
    const {
      address,
      abi,
      functionName,
      args = [],
      dialogClassName = "sm:w-[512px]",
      onSubmitSafeTransaction,
    } = params;

    if (isSelectedPrimaryAddress) {
      return writeContract({
        address,
        abi,
        functionName,
        args,
      });
    } else {
      handleSafeTransaction(
        address,
        abi,
        functionName,
        args,
        onSubmitSafeTransaction,
        dialogClassName
      );
      return Promise.resolve();
    }
  };

  // Async write function
  const writeAsync = async (params: WriteContractParams | any) => {
    // Handle the case where params is a wagmi request config
    if ("request" in params) {
      const {
        request,
        onSubmitSafeTransaction,
        dialogClassName = "sm:w-[512px]",
      } = params;
      const { address, abi, functionName, args = [] } = request;

      if (isSelectedPrimaryAddress) {
        return await writeContractAsync(request);
      } else {
        return handleSafeTransaction(
          address,
          abi,
          functionName,
          args,
          onSubmitSafeTransaction,
          dialogClassName
        );
      }
    } else {
      // Handle our custom params format
      const {
        address,
        abi,
        functionName,
        args = [],
        dialogClassName = "sm:w-[512px]",
        onSubmitSafeTransaction,
      } = params;

      if (isSelectedPrimaryAddress) {
        return await writeContractAsync({
          address,
          abi,
          functionName,
          args,
        });
      } else {
        return handleSafeTransaction(
          address,
          abi,
          functionName,
          args,
          onSubmitSafeTransaction,
          dialogClassName
        );
      }
    }
  };

  return {
    data,
    writeContract: write,
    writeContractAsync: writeAsync,
    isPending,
    isSuccess,
    error,
    reset,
    isError,
  };
}
