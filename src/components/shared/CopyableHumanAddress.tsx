"use client"

import React, { useState, useEffect } from "react";
import ENSName from "./ENSName"; // adjust the import path as per your project structure
import { HStack } from "@/components/Layout/Stack";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { ClipboardIcon } from "@heroicons/react/24/outline";

// This component will display the ENS name for a given address
// It will also be copyable, meaning that when clicked, it will copy the address to the clipboard
// It will also show a checkmark when the address has been copied
function CopyableHumanAddress({ address }: {address: string}) {
    const [isInCopiedState, setIsInCopiedState] = useState<boolean>(false)

    useEffect(() => {
        let id = null;
        if (isInCopiedState) {
            id = setTimeout(() => {
                setIsInCopiedState(false)
            }, 750)
        }
        return () => {
            if (id) clearTimeout(id)
        }
    }, [isInCopiedState])


    return (
        <HStack alignItems="items-center" className="cursor-pointer group" gap={1} onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigator.clipboard.writeText(address)
            setIsInCopiedState(true)
        }}>
            <ENSName address={address} />
            {
                isInCopiedState 
                ? <CheckCircleIcon className="text-green-600 w-4 h-4" />
                : <ClipboardIcon className="text-primary w-4 h-4 hidden group-hover:block" />
            }
        </HStack>
    )
}

export default CopyableHumanAddress;
