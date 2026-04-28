import { useQuery } from "@tanstack/react-query";
import { isHash } from "viem";
import { getPublicClient } from "@/lib/viem";
import Tenant from "@/lib/tenant/tenant";

export function useExecutionTxOverview(txHash: `0x${string}` | string) {
  const { contracts } = Tenant.current();
  const chainId = contracts.token.chain.id;
  const valid = isHash(txHash as `0x${string}`);

  return useQuery({
    queryKey: ["executionTxOverview", chainId, txHash],
    queryFn: async () => {
      if (!isHash(txHash as `0x${string}`)) {
        throw new Error("Invalid transaction hash");
      }
      const h = txHash as `0x${string}`;
      const client = getPublicClient();
      const [receipt, tx] = await Promise.all([
        client.getTransactionReceipt({ hash: h }),
        client.getTransaction({ hash: h }),
      ]);
      if (!receipt) {
        throw new Error("Transaction not found on chain");
      }
      return { receipt, tx };
    },
    enabled: valid,
    staleTime: Infinity,
  });
}
