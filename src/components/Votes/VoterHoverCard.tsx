"use client";

import React from "react";
import { DelegateProfileImage } from "../Delegates/DelegateCard/DelegateProfileImage";
import Link from "next/link";
import { DelegateSocialLinks } from "../Delegates/DelegateCard/DelegateSocialLinks";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { useAccount } from "wagmi";
import { AdvancedDelegateButton } from "../Delegates/DelegateCard/AdvancedDelegateButton";
import { DelegateButton } from "../Delegates/DelegateCard/DelegateButton";
import { useDelegate } from "@/hooks/useDelegate";

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
  const { data: delegate } = useDelegate({ address: address as `0x${string}` });
  const { isConnected } = useAgoraContext();
  const { address: connectedAddress } = useAccount();

  if (delegate === undefined) {
    return (
      <div className="flex flex-col gap-4 h-full w-[300px] p-2">
        <div className="flex flex-col gap-4 justify-center">
          <div className="flex flex-row gap-4 justify-start">
            <div className="w-14 h-14 rounded-full bg-line animate-pulse" />
            <div className="flex flex-col gap-2 justify-center">
              <div className="w-24 h-4 rounded-md bg-line animate-pulse" />
              <div className="w-12 h-4 rounded-md bg-line animate-pulse" />
            </div>
          </div>
          <div className="w-full h-12 rounded-md bg-line animate-pulse" />
        </div>
      </div>
    );
  }

  const truncatedStatement =
    delegate.statement === null
      ? null
      : delegate.statement.payload?.delegateStatement?.slice(0, 120) || "";

  return (
    <div className="flex flex-col h-full w-[300px] gap-4">
      <Link href={`/delegates/${address}`}>
        <div className="flex flex-col gap-4 justify-center">
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
        </div>
      </Link>
      <div className="flex-grow" />
      <div className="flex flex-row justify-between items-stretch">
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
      </div>
    </div>
  );
}
