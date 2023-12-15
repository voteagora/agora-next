import { OptimismContracts } from "@/lib/contracts/contracts";
import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { formatEther } from "viem";
import { useContractWrite } from "wagmi";

const useAdvancedDelegation = ({
  isDelegatingToProxy,
  proxyAddress,
  target,
  allocation,
}: {
  isDelegatingToProxy: boolean;
  proxyAddress: string;
  target: string | string[];
  allocation: number | number[];
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    write: subdelegate,
    isLoading: subdelegateIsLoading,
    isError: subdelegateIsError,
    isSuccess: subdelegateIsSuccess,
  } = useContractWrite({
    address: OptimismContracts.alligator.address as any,
    abi: OptimismContracts.alligator.abi,
    functionName: Array.isArray(target) ? "subdelegateBatched" : "subdelegate",
    args: [target as any, buildRules(allocation) as any],
  });

  const {
    write: delegateToProxy,
    isLoading: delegateToProxyIsLoading,
    isError: delegateToProxyIsError,
    isSuccess: delegateToProxyIsSuccess,
  } = useContractWrite({
    address: OptimismContracts.token.address as any,
    abi: OptimismContracts.token.abi,
    functionName: "delegate",
    args: [proxyAddress as any],
  });

  const write = useCallback(() => {
    const delegate = async () => {
      setIsLoading(true);
      setIsError(false);
      setIsSuccess(false);

      if (!isDelegatingToProxy) {
        delegateToProxy();
      }
      subdelegate();
    };

    delegate();
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

  return { isLoading, isError, isSuccess, write };
};

function buildRules(allocation: number | number[]) {
  if (Array.isArray(allocation)) {
    return allocation.map((amount) => {
      return {
        ...baseRules,
        allowance: formatEther(BigInt(amount || 0)),
      };
    });
  }

  return {
    ...baseRules,
    allowance: formatEther(BigInt(allocation || 0)),
  };
}

const baseRules = {
  customRule: ethers.ZeroAddress as `0x${string}`,
  permissions: 0,
  notValidAfter: 0,
  notValidBefore: 0,
  maxRedelegations: 0xff, // 255
  blocksBeforeVoteCloses: 0,
  allowanceType: 1, // 1 - relative; 0 - absolute
  allowance: 0n,
};

export default useAdvancedDelegation;
