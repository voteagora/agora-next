"use client";

import { useAgoraContext } from "@/contexts/AgoraContext";
import { useEffect, useState } from "react";
import { useAccount, useContractRead } from "wagmi";
import Tenant from "@/lib/tenant/tenant";

const useIsOpManager = () => {
  const { isConnected } = useAgoraContext();
  const { address } = useAccount();
  const [isOpManager, setIsOpManager] = useState(false);
  const { contracts } = Tenant.current();

  const governorContract = {
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    chainId: contracts.governor.chain.id,
  };

  const { data } = useContractRead({
    ...governorContract,
    functionName: "manager",
    enabled: isConnected && !!address,
  });

  useEffect(() => {
    if (data) {
      setIsOpManager(String(data).toLowerCase() === address?.toLowerCase());
    }
  }, [data, address]);

  return { isOpManager };
};

export default useIsOpManager;
