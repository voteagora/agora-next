import { blockNumberAndTransactionIndexToHash } from "@/lib/serverUtils";
import { useQuery } from "@tanstack/react-query";

export const useBnAndTidToHash = ({
  blockNumber,
  transactionIndex,
  enabled = false,
}: {
  blockNumber?: number;
  transactionIndex?: number;
  enabled?: boolean;
}) => {
  const { data, isPending, error } = useQuery({
    queryKey: [
      "blockNumberAndTransactionIndexToHash",
      blockNumber,
      transactionIndex,
    ],
    enabled: enabled,
    queryFn: () =>
      blockNumberAndTransactionIndexToHash(blockNumber, transactionIndex),
  });

  return { data, isPending, error };
};
