import { useQuery } from "@tanstack/react-query";
import { cachedDecodeEnhanced } from "@/lib/transactionDecoder";

export const useTransactionDecoding = (
  target: string,
  calldata: `0x${string}`,
  value: string,
  network: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["transactionDecode", target, calldata, value, network],
    queryFn: async () => {
      if (!calldata || calldata === "0x") {
        if (value && BigInt(value) > 0n) {
          return {
            function: "transfer",
            parameters: {
              value: {
                type: "uint256",
                value: value,
              },
              to: {
                type: "address",
                value: target,
              },
            },
          };
        }
        return null;
      }

      return await cachedDecodeEnhanced(
        target,
        calldata,
        process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY as string,
        network
      );
    },
    staleTime: 60 * 60 * 1000,
    enabled: options?.enabled !== false,
  });
};
