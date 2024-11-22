"use client";

import React, { useEffect, useState } from "react";
import { VStack, HStack } from "@/components/Layout/Stack";
import { DelegateProfileImage } from "../Delegates/DelegateCard/DelegateProfileImage";
import Link from "next/link";
import { DelegateSocialLinks } from "../Delegates/DelegateCard/DelegateSocialLinks";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { useAccount } from "wagmi";
import { AdvancedDelegateButton } from "../Delegates/DelegateCard/AdvancedDelegateButton";
import { DelegateButton } from "../Delegates/DelegateCard/DelegateButton";
import { Delegate } from "@/app/api/common/delegates/delegate";
import { fetchDelegate } from "@/app/delegates/actions";

interface Props {
  address: string;
  isAdvancedUser: boolean;
  delegators: string[] | null;
}

export default function VoterHoverCard({
  address,
  isAdvancedUser,
  delegators,
}: Props) {
  // full delegate object is required for the delegate button, that can appear later
  const [delegate, setDelegate] = useState<Delegate>();

  const { isConnected } = useAgoraContext();
  const { address: connectedAddress } = useAccount();

  useEffect(() => {
    fetchDelegate(address).then(setDelegate);
  }, [address]);

  if (delegate === undefined) {
    return (
      <VStack gap={4} className="h-full w-[300px] p-2">
        <VStack gap={4} justifyContent="justify-center">
          <HStack gap={4} justifyContent="justify-start">
            <div className="w-14 h-14 rounded-full bg-line animate-pulse" />
            <VStack gap={2} justifyContent="justify-center">
              <div className="w-24 h-4 rounded-md bg-line animate-pulse" />
              <div className="w-12 h-4 rounded-md bg-line animate-pulse" />
            </VStack>
          </HStack>
          <div className="w-full h-12 rounded-md bg-line animate-pulse" />
        </VStack>
      </VStack>
    );
  }

  const truncatedStatement =
    delegate.statement === null
      ? null
      : delegate.statement.payload?.delegateStatement?.slice(0, 120) || "";

  return (
    <VStack gap={4} className="h-full w-[300px]">
      <Link href={`/delegates/${address}`}>
        <VStack gap={4} justifyContent="justify-center">
          <DelegateProfileImage
            address={address}
            endorsed={!!delegate.statement?.endorsed}
            votingPower={delegate.votingPower.total}
          />
          <p
            className={`break-words text-secondary overflow-hidden line-clamp-2 text-ellipsis`}
          >
            {truncatedStatement === null
              ? "This delegate has not yet created a delegate statement."
              : truncatedStatement}
          </p>
        </VStack>
      </Link>
      <div className="flex-grow" />
      <HStack alignItems="items-stretch" className="justify-between">
        <DelegateSocialLinks
          warpcast={delegate.statement?.warpcast}
          discord={delegate.statement?.discord}
          twitter={delegate.statement?.twitter}
        />
        <div>
          {isConnected &&
            connectedAddress &&
            (isAdvancedUser ? (
              <AdvancedDelegateButton
                delegate={delegate}
                delegators={delegators}
              />
            ) : (
              <DelegateButton
                full={
                  !delegate.statement?.twitter && !delegate.statement?.discord
                }
                delegate={delegate}
              />
            ))}
        </div>
      </HStack>
    </VStack>
  );
}
