import { useQuery } from "@tanstack/react-query";
import { getAlchemyId } from "@/lib/alchemyConfig";
import { BLOCKCACHEURL } from "@/lib/constants";

interface UseBlockCacheTransactionDetailsProps {
  chainId: number;
  blockNumber?: string;
  transactionIndex?: number;
  enabled?: boolean;
}

interface TransactionDetails {
  tx: string;
}

const useBlockCacheTransactionDetails = ({
  chainId,
  blockNumber,
  transactionIndex,
}: UseBlockCacheTransactionDetailsProps) => {
  const { data, isLoading, error } = useQuery<TransactionDetails>({
    queryKey: ["blockCacheTransaction", chainId, blockNumber, transactionIndex],
    queryFn: async () => {
      const headers: HeadersInit = {};

      try {
        const alchemyId = getAlchemyId();
        headers["alchemy-api-key"] = alchemyId;
      } catch (error) {
        // Key not available, continue without it
      }

      const response = await fetch(
        `${BLOCKCACHEURL}/transaction/${chainId}/${blockNumber}/${transactionIndex}`,
        {
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch transaction details: ${response.statusText}`
        );
      }

      return response.json();
    },
    enabled: !!chainId && !!blockNumber && !!transactionIndex,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  return { data, isLoading, error };
};

export default useBlockCacheTransactionDetails;
