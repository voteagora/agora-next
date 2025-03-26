"use client";

import { useEffect, useState } from "react";
import { useEnsName } from "wagmi";
import { truncateAddress } from "@/app/lib/utils/text";

interface ENSNameProps {
  address: string;
  truncate?: boolean;
}

// This component will display the ENS name for a given address
export default function ENSName({ address, truncate = true }: ENSNameProps) {
  const [ensName, setEnsName] = useState(
    truncate ? truncateAddress(address || "") : address || ""
  );

  const { data } = useEnsName({
    chainId: 1,
    address: address as `0x${string}`,
  });

  useEffect(() => {
    if (data) {
      setEnsName(data); // Set ENS name if available
    } else {
      setEnsName(truncate ? truncateAddress(address) : address); // Fallback
    }
  }, [data, address, truncate]);

  return truncate
    ? ensName || `${address.slice(0, 6)}...${address.slice(-4)}`
    : ensName || address;
}
