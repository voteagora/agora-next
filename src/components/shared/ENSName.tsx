"use client";

import { useEffect, useState } from "react";
import { useEnsName } from "wagmi";
import { truncateAddress } from "@/app/lib/utils/text";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ENSNameProps {
  address: string;
  truncate?: boolean;
  includeCtoC?: boolean;
}

// This component will display the ENS name for a given address
export default function ENSName({
  address,
  truncate = true,
  includeCtoC = false,
}: ENSNameProps) {
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

  const displayText = truncate
    ? ensName || truncateAddress(address)
    : ensName || address;

  const fullText = ensName || address;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullText);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>{displayText}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{address}</p>
        </TooltipContent>
      </Tooltip>
      {includeCtoC && (
        <button
          onClick={copyToClipboard}
          className="ml-1 opacity-50 hover:opacity-100 cursor-pointer"
          aria-label="Copy to clipboard"
        >
          📋
        </button>
      )}
    </TooltipProvider>
  );
}
