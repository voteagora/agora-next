import { useWaitForTransactionReceipt } from "wagmi";
import { useSafeOnChainTxHash } from "@/lib/safe/safeTransactions";
import { useEffect, useState } from "react";

export function useWaitForTransactionReceiptWithSafe({
  hash,
  isSafeWallet,
  chainId,
}: {
  hash: `0x${string}` | undefined;
  isSafeWallet: boolean;
  chainId: number;
}) {
  const [finalHash, setFinalHash] = useState<`${string}` | undefined>(
    isSafeWallet ? undefined : hash
  );

  // If it's a Safe transaction, get the on-chain transaction hash
  const { data: onChainTxHash, isLoading: isLoadingSafeTx } =
    useSafeOnChainTxHash(
      isSafeWallet ? hash : undefined,
      chainId,
      isSafeWallet
    );

  // Update the final hash when the on-chain hash is available
  useEffect(() => {
    if (isSafeWallet && onChainTxHash) {
      setFinalHash(onChainTxHash);
    } else if (!isSafeWallet) {
      setFinalHash(hash);
    }
  }, [isSafeWallet, onChainTxHash, hash]);

  // Wait for the transaction receipt using the final hash
  const txReceipt = useWaitForTransactionReceipt({
    hash: finalHash as `0x${string}`,
  });

  // Combine the statuses
  return {
    ...txReceipt,
    isLoading: txReceipt.isLoading || (isSafeWallet && isLoadingSafeTx),
    // For Safe transactions, consider it "pending" while we're waiting for the on-chain hash
    isPending: txReceipt.isPending || (isSafeWallet && !onChainTxHash),
    safeTxHash: isSafeWallet ? hash : undefined,
    onChainTxHash: finalHash,
  };
}
