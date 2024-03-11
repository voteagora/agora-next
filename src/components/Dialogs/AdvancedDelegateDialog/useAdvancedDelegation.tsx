import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { formatUnits } from "viem";
import { optimism } from "viem/chains";
import { useContractWrite } from "wagmi";
import Tenant from "@/lib/tenant/tenant";

const allowanceType = 1; // 1 - relative; 0 - absolute

const useAdvancedDelegation = ({
  availableBalance,
  isDelegatingToProxy,
  proxyAddress,
  target,
  allocation,
}: {
  availableBalance: string;
  isDelegatingToProxy: boolean;
  proxyAddress: string;
  target: string | string[];
  allocation: number | number[];
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { contracts } = Tenant.current();

  const availableBalanceNumber = Number(
    formatUnits(BigInt(availableBalance), 18)
  );

  const {
    writeAsync: subdelegate,
    isLoading: subdelegateIsLoading,
    isError: subdelegateIsError,
    isSuccess: subdelegateIsSuccess,
    data: subdelegateData,
  } = useContractWrite({
    address: contracts.alligator!.address as `0x${string}`,
    abi: contracts.alligator!.abi,
    functionName: Array.isArray(target) ? "subdelegateBatched" : "subdelegate",
    args: [
      target as any,
      buildRules(allocation, availableBalanceNumber) as any,
    ],
    chainId: optimism.id,
  });

  const {
    writeAsync: delegateToProxy,
    isLoading: delegateToProxyIsLoading,
    isError: delegateToProxyIsError,
    isSuccess: delegateToProxyIsSuccess,
    data: delegateToProxyData,
  } = useContractWrite({
    address: contracts.token.address as `0x${string}`,
    abi: contracts.token.abi,
    functionName: "delegate",
    args: [proxyAddress as any],
    chainId: optimism.id,
  });

  const writeAsync = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setIsSuccess(false);

    if (!isDelegatingToProxy) {
      await delegateToProxy();
    }
    return await subdelegate();
  }, [isDelegatingToProxy, delegateToProxy, subdelegate]);

  useEffect(() => {
    if (delegateToProxyIsLoading || subdelegateIsLoading) {
      setIsLoading(true);
    }
    if (delegateToProxyIsError || subdelegateIsError) {
      setIsError(true);
      setIsLoading(false);
    }
    if (
      (isDelegatingToProxy || delegateToProxyIsSuccess) &&
      subdelegateIsSuccess
    ) {
      setIsSuccess(true);
      setIsLoading(false);
    }
  }, [
    delegateToProxyIsLoading,
    subdelegateIsLoading,
    delegateToProxyIsError,
    subdelegateIsError,
    delegateToProxyIsSuccess,
    subdelegateIsSuccess,
    isDelegatingToProxy,
  ]);

  return {
    isLoading,
    isError,
    isSuccess,
    writeAsync,
    data: {
      delegateToProxyData,
      subdelegateData,
    },
  };
};

function buildRules(
  allocation: number | number[],
  availableBalanceNumber: number
) {
  if (Array.isArray(allocation)) {
    return allocation.map((amount) => {
      return {
        ...baseRules,
        allowance: amount
          ? allowanceType == 1
            ? Math.round((amount / availableBalanceNumber) * 100_000).toString()
            : amount.toString()
          : "0",
      };
    });
  }

  return {
    ...baseRules,
    allowance: allocation
      ? allowanceType == 1
        ? Math.round((allocation / availableBalanceNumber) * 100_000).toString()
        : allocation.toString()
      : "0",
  };
}

const baseRules = {
  customRule: ethers.ZeroAddress as `0x${string}`,
  permissions: 0,
  notValidAfter: 0,
  notValidBefore: 0,
  maxRedelegations: 0xff, // 255
  blocksBeforeVoteCloses: 0,
  allowanceType,
  allowance: 0n,
};

export default useAdvancedDelegation;
