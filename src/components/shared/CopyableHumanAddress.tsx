"use client";

import React, { useEffect, useState } from "react";
import ENSName from "./ENSName"; // adjust the import path as per your project structure
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEnsName } from "wagmi";

// This component will display the ENS name for a given address
// It will also be copyable, meaning that when clicked, it will copy the address to the clipboard
// It will also show a checkmark when the address has been copied
function CopyableHumanAddress({
  address,
  useAddress = false,
  className = "",
  copyENSName = false,
}: {
  address: string;
  useAddress?: boolean;
  className?: string;
  copyENSName?: boolean;
}) {
  const [isInCopiedState, setIsInCopiedState] = useState<boolean>(false);

  const { data } = useEnsName({
    chainId: 1,
    address: address as `0x${string}`,
  });

  useEffect(() => {
    let id: NodeJS.Timeout | number | null = null;
    if (isInCopiedState) {
      id = setTimeout(() => {
        setIsInCopiedState(false);
      }, 750);
    }
    return () => {
      if (id) clearTimeout(id);
    };
  }, [isInCopiedState]);

  return (
    <div
      className={cn(
        "flex flex-row gap-1 items-center cursor-pointer group text-primary",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(copyENSName ? data || address : address);
        setIsInCopiedState(true);
      }}
    >
      {useAddress ? (
        `${address.slice(0, 6)}...${address.slice(-4)}`
      ) : (
        <ENSName address={address} />
      )}
      {isInCopiedState ? (
        <CheckCircleIcon className="text-green-600 w-3 h-3" />
      ) : (
        <Copy className="w-3 h-3 hidden group-hover:block group-hover:opacity-90" />
      )}
    </div>
  );
}

export default CopyableHumanAddress;
