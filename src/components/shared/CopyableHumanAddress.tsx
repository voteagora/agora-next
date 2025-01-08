"use client";

import React, { useEffect, useState } from "react";
import ENSName from "./ENSName"; // adjust the import path as per your project structure
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { ClipboardIcon } from "@/icons/ClipboardIcon";
import { rgbStringToHex } from "@/app/lib/utils/color";
import Tenant from "@/lib/tenant/tenant";

// This component will display the ENS name for a given address
// It will also be copyable, meaning that when clicked, it will copy the address to the clipboard
// It will also show a checkmark when the address has been copied
function CopyableHumanAddress({ address }: { address: string }) {
  const [isInCopiedState, setIsInCopiedState] = useState<boolean>(false);
  const { ui } = Tenant.current();
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
      className="flex flex-row gap-1 items-center cursor-pointer group text-primary"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(address);
        setIsInCopiedState(true);
      }}
    >
      <ENSName address={address} />
      {isInCopiedState ? (
        <CheckCircleIcon className="text-green-600 w-4 h-4" />
      ) : (
        <ClipboardIcon
          fill={rgbStringToHex(ui.customization?.primary)}
          className="w-4 h-4 hidden group-hover:block group-hover:opacity-90"
        />
      )}
    </div>
  );
}

export default CopyableHumanAddress;
