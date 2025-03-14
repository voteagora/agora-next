import { useQuery } from "@tanstack/react-query";
import { cachedDecodeEnhanced } from "@/lib/transactionDecoder";
import { keccak256 } from "viem";
import { toUtf8Bytes } from "ethers";

export const useTransactionDecoding = (
  target: string,
  calldata: `0x${string}`,
  value: string,
  network: string,
  signature?: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [
      "transactionDecode",
      target,
      calldata,
      value,
      network,
      signature,
    ],
    queryFn: async () => {
      const signatureSelector =
        signature && signature.length > 5
          ? keccak256(toUtf8Bytes(signature)).substring(0, 10)
          : null;

      const parsedCalldata =
        calldata.length < 10
          ? (signatureSelector ?? calldata)
          : calldata.startsWith("0x00000000") && signatureSelector
            ? signatureSelector + calldata.slice(2)
            : calldata;

      if (!parsedCalldata || parsedCalldata === "0x") {
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
        parsedCalldata,
        process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY as string,
        network
      );
    },
    staleTime: 60 * 60 * 1000,
    enabled: options?.enabled !== false,
  });
};
