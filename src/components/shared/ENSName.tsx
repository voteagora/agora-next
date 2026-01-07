"use client";

import { useEffect, useState } from "react";
import { useEnsName } from "wagmi";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { Copy } from "lucide-react";
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
  const [isInCopiedState, setIsInCopiedState] = useState(false);

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

  const displayText = truncate
    ? ensName || truncateAddress(address)
    : ensName || address;

  const fullText = ensName || address;

  const copyToClipboard = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(fullText);
    setIsInCopiedState(true);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={includeCtoC ? "group cursor-pointer" : ""}>
            {displayText}
            {includeCtoC && (
              <span
                onClick={copyToClipboard}
                className="ml-1 inline-flex items-center"
                aria-label="Copy to clipboard"
              >
                {isInCopiedState ? (
                  <CheckCircleIcon className="text-green-600 w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3 hidden group-hover:inline-block group-hover:opacity-90" />
                )}
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{address}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
