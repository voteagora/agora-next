"use client";

import { useMemo } from "react";
import { parseUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import Tenant from "@/lib/tenant/tenant";

const allowList = [] as `0x${string}`[];

const useIsAdvancedUser = () => {
  const { contracts, isProd } = Tenant.current();
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

  /**
   * @dev Checks if the user is an advanced user
   * PROD: only allowlist
   * TEST: more than 1 token or allowlist
   */
  const isAdvancedUser = useMemo(() => {
    if (!isBalanceFetched) return false;
    if (!address) return false;
    if (!balance) return false;
    const allowedBalance = parseUnits("100000", 18);
    return isProd
      ? allowList.includes(address)
      : balance >= allowedBalance || allowList.includes(address);
  }, [address, balance, isBalanceFetched, isProd]);

  return { isAdvancedUser };
};

export default useIsAdvancedUser;
