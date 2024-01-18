"use client";

import { useAgoraContext } from "@/contexts/AgoraContext";
import { useEffect, useState } from "react";
import { useAccount, useContractRead } from "wagmi";
import { OptimismContracts } from "@/lib/contracts/contracts";

const useIsOpManager = () => {
  const { isConnected } = useAgoraContext();
  const { address } = useAccount();
  const [isOpManager, setIsOpManager] = useState(false);

  const governorContract = {
    address: OptimismContracts.governor.address,
    abi: OptimismContracts.governor.abi,
    chainId: 10,
  };

  const { data } = useContractRead({
    ...governorContract,
    functionName: "manager",
    enabled: isConnected && !!address,
  });

  useEffect(() => {
    if (data) {
      setIsOpManager(data.toLowerCase() === address?.toLowerCase());
    }
  }, [data, address]);

  return { isOpManager };
};

export default useIsOpManager;
