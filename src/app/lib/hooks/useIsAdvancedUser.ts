"use client";

import { useAgoraContext } from "@/contexts/AgoraContext";
import { OptimismContracts } from "@/lib/contracts/contracts";
import { useState } from "react";
import { parseUnits } from "viem";
import { useAccount, useContractRead } from "wagmi";

const useIsAdvancedUser = () => {
  const { isConnected } = useAgoraContext();
  const { address } = useAccount();
  const [isAdvancedUser, setIsAdvancedUser] = useState(false);
  const allowList = [
    "0x4D5d7d63989BBE6358a3352A2449d59Aa5A08267",
    "0xd0f23E5ea6c8088eD0FFf294F3fC29e719EE6B8b",
  ] as `0x${string}`[];

  useContractRead({
    address: OptimismContracts.token.address as `0x${string}`,
    abi: OptimismContracts.token.abi,
    functionName: "balanceOf",
    enabled: isConnected && !!address,
    args: [address!],
    /**
     * @dev Checks if the user is an advanced user
     * PROD: only allowlist
     * TEST: more than 1 token or allowlist
     */
    onSuccess: (balance) => {
      const allowedBalance = parseUnits("100000", 18);
      setIsAdvancedUser(
        process.env.NEXT_PUBLIC_AGORA_ENV === "prod"
          ? allowList.includes(address!)
          : balance >= allowedBalance || allowList.includes(address!)
      );
    },
  });

  return { isAdvancedUser };
};

export default useIsAdvancedUser;
