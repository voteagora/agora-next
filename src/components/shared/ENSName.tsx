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
  console.log("ENSName received address:", address);

  const [ensName, setEnsName] = useState(
    address && address.trim()
      ? truncate
        ? truncateAddress(address)
        : address
      : "Unknown"
  );

  const { data } = useEnsName({
    chainId: 1,
    address:
      address && address.startsWith("0x")
        ? (address as `0x${string}`)
        : undefined,
  });

  useEffect(() => {
    if (data) {
      setEnsName(data); // Set ENS name if available
    } else if (address && address.trim()) {
      setEnsName(truncate ? truncateAddress(address) : address); // Fallback
    } else {
      setEnsName("Unknown");
    }
  }, [data, address, truncate]);

  return truncate
    ? ensName ||
        (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Unknown")
    : ensName || address || "Unknown";
}
