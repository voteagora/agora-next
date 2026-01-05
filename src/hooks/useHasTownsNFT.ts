"use client";

import { useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { erc721Abi } from "viem";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";

const TOWNS_NFT_ADDRESS =
  "0x7c0422b31401C936172C897802CF0373B35B7698" as `0x${string}`;

export function useHasTownsNFT() {
  const { namespace, contracts } = Tenant.current();
  const { address } = useAccount();

  const isTowns = namespace === TENANT_NAMESPACES.TOWNS;

  const { data: balance, isFetched } = useReadContract({
    address: TOWNS_NFT_ADDRESS,
    abi: erc721Abi,
    functionName: "balanceOf",
    query: {
      enabled: !!address && isTowns,
    },
    args: [address!],
    chainId: contracts.token.chain.id,
  }) as { data: bigint | undefined; isFetched: boolean };

  const hasNFT = useMemo(() => {
    if (!isTowns) return false;
    if (!isFetched) return false;
    if (!address) return false;
    if (!balance) return false;
    return balance > 0n;
  }, [isTowns, isFetched, address, balance]);

  return { hasNFT, isFetched };
}
