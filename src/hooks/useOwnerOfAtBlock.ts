import { useQuery } from "@tanstack/react-query";
import { getPublicClient } from "@/lib/viem";
import { erc721Abi } from "viem";

/**
 * Fetches the owner of an NFT at a specific block number.
 * Used for historical lookups (e.g., showing who owned a token before it was burned).
 */
export function useOwnerOfAtBlock({
  tokenAddress,
  tokenId,
  blockNumber,
  enabled = true,
}: {
  tokenAddress: `0x${string}`;
  tokenId: bigint;
  blockNumber?: number;
  enabled?: boolean;
}) {
  const client = getPublicClient();

  return useQuery({
    queryKey: ["ownerOf", tokenAddress, tokenId.toString(), blockNumber],
    queryFn: async () => {
      try {
        const owner = await client.readContract({
          address: tokenAddress,
          abi: erc721Abi,
          functionName: "ownerOf",
          args: [tokenId],
          blockNumber: blockNumber ? BigInt(blockNumber) : undefined,
        });
        return owner as `0x${string}`;
      } catch {
        return null;
      }
    },
    enabled: enabled && !!tokenAddress && !!blockNumber,
    staleTime: Infinity,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}
