"use client";

import { useEffect, useState } from "react";
import { useEnsName } from "wagmi";
import { truncateAddress } from "@/app/lib/utils/text";

// This component will display the ENS name for a given address
const ENSName = ({ address }: { address: string | `0x${string}` }) => {
  const [ensName, setEnsName] = useState(truncateAddress(address || ""));

  const { data } = useEnsName({
    chainId: 1,
    address: address as `0x${string}`,
  });

  useEffect(() => {
    if (data) {
      setEnsName(data); // Set ENS name if available
    } else {
      setEnsName(truncateAddress(address)); // Fallback to truncated address
    }
  }, [data, address]);

  return <span>{ensName}</span>;
};

export default ENSName;
