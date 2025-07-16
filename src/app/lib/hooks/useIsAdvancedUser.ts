"use client";

import { useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import Tenant from "@/lib/tenant/tenant";

const allowList = [] as `0x${string}`[];

const useIsAdvancedUser = () => {
  const { contracts } = Tenant.current();
  const { address } = useAccount();

  const { data: balance, isFetched: isBalanceFetched } = useReadContract({
    address: contracts.token.address as `0x${string}`,
    abi: contracts.token.abi,
    functionName: "balanceOf",
    query: {
      enabled: !!address,
    },
    args: [address!],
    chainId: contracts.token.chain.id,
  }) as { data: bigint | undefined; isFetched: boolean };

  // TODO: Need to remove all of advanced delegation
  const isAdvancedUser = useMemo(() => {
    if (!isBalanceFetched) return false;
    if (!address) return false;
    if (!balance) return false;
    return allowList.includes(address);
  }, [address, balance, isBalanceFetched]);

  return { isAdvancedUser };
};

export default useIsAdvancedUser;
