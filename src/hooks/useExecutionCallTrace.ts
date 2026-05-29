import { useQuery } from "@tanstack/react-query";
import { isHash } from "viem";
import { getPublicClient } from "@/lib/viem";
import {
  parseCallTracerResult,
  type CallFrame,
} from "@/lib/execution/callTrace";
import Tenant from "@/lib/tenant/tenant";

export function useExecutionCallTrace(txHash: `0x${string}` | string) {
  const { contracts } = Tenant.current();
  const chainId = contracts.token.chain.id;
  const valid = isHash(txHash as `0x${string}`);

  return useQuery({
    queryKey: ["executionCallTrace", chainId, txHash],
    queryFn: async () => {
      if (!isHash(txHash as `0x${string}`)) {
        throw new Error("Invalid transaction hash");
      }
      const client = getPublicClient();
      const raw: unknown = await (
        client as unknown as {
          request: (args: {
            method: string;
            params: [string, { tracer: string }];
          }) => Promise<unknown>;
        }
      ).request({
        method: "debug_traceTransaction",
        params: [txHash as `0x${string}`, { tracer: "callTracer" }],
      });
      return parseCallTracerResult(raw) as CallFrame | null;
    },
    enabled: valid,
    staleTime: Infinity,
    retry: false,
  });
}
