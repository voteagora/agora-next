import SafeApiKit from "@safe-global/api-kit";
import { useQuery } from "@tanstack/react-query";

/**
 * Get the on-chain transaction hash from a Safe transaction hash
 */
export async function getSafeOnChainTxHash(
  safeTransactionHash: `0x${string}` | undefined,
  chainId: number
): Promise<`${string}` | undefined> {
  if (!safeTransactionHash) return undefined;

  try {
    const safeApiKit = new SafeApiKit({
      chainId: BigInt(chainId),
    });

    // Get the Safe transaction details
    const txDetails = await safeApiKit.getTransaction(safeTransactionHash);

    // If the transaction has been executed, return the on-chain transaction hash
    return txDetails.transactionHash;
  } catch (error) {
    console.error("Error getting Safe transaction:", error);
    return undefined;
  }
}

/**
 * Hook to get the on-chain transaction hash from a Safe transaction hash
 */
export function useSafeOnChainTxHash(
  safeTransactionHash: `0x${string}` | undefined,
  chainId: number,
  enabled = true
) {
  return useQuery({
    queryKey: ["safeOnChainTxHash", safeTransactionHash, chainId],
    queryFn: () => getSafeOnChainTxHash(safeTransactionHash, chainId),
    enabled: !!safeTransactionHash && enabled,
    refetchInterval: 5000, // Poll every 5 seconds until we get a result
    refetchIntervalInBackground: true,
  });
}
