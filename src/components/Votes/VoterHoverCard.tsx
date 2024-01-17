"use client";

import React, { useEffect, useState } from "react";
import { VStack, HStack } from "@/components/Layout/Stack";
import { DelegateProfileImage } from "../Delegates/DelegateCard/DelegateProfileImage";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DelegateSocialLinks } from "../Delegates/DelegateCard/DelegateSocialLinks";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { useAccount } from "wagmi";
import { AdvancedDelegateButton } from "../Delegates/DelegateCard/AdvancedDelegateButton";
import { DelegateButton } from "../Delegates/DelegateCard/DelegateButton";
import { Delegate } from "@/app/api/delegates/delegate";
import { type DelegateStatement } from "@/app/api/delegateStatement/delegateStatement";
import { Delegation } from "@/app/api/delegations/delegation";

interface Props {
  address: string;
  fetchDelegate: (addressOrENSName: string) => Promise<any>;
  fetchDelegateStatement: (addressOrENSName: string) => Promise<any>;
  fetchBalanceForDirectDelegation: (
    addressOrENSName: string
  ) => Promise<string>;
  fetchVotingPowerForSubdelegation: (
    addressOrENSName: string
  ) => Promise<string>;
  checkIfDelegatingToProxy: (addressOrENSName: string) => Promise<boolean>;
  fetchCurrentDelegatees: (addressOrENSName: string) => Promise<any>;
  fetchDirectDelegatee: (addressOrENSName: string) => Promise<any>;
  getProxyAddress: (addressOrENSName: string) => Promise<string>;
  isAdvancedUser: boolean;
  delegators: Delegation[] | null;
}

export default function VoterHoverCard({
  address,
  fetchDelegate,
  fetchDelegateStatement,
  fetchBalanceForDirectDelegation,
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
  fetchDirectDelegatee,
  getProxyAddress,
  isAdvancedUser,
  delegators,
}: Props) {
  const router = useRouter();
  // delegateStatement is loaded separately to avoid delays in loading the hover card
  const [delegateStatement, setDelegateStatement] =
    useState<DelegateStatement>();
  // full delegate object is required for the delegate button, that can appear later
  const [delegate, setDelegate] = useState<Delegate>();

  const { isConnected } = useAgoraContext();
  const { address: connectedAddress } = useAccount();

  const fetchDelegateAndSet = async (addressOrENSName: string) => {
    const delegate = await fetchDelegate(addressOrENSName);
    setDelegate(delegate);
  };

  const fetchDelegateStatementAndSet = async (addressOrENSName: string) => {
    const delegateStatement = await fetchDelegateStatement(addressOrENSName);
    setDelegateStatement(delegateStatement);
  };

  useEffect(() => {
    fetchDelegateStatementAndSet(address);
    fetchDelegateAndSet(address);
  }, []);

  let truncatedStatement = "";
  if (delegate?.statement?.payload) {
    const delegateStatement = (
      delegate?.statement?.payload as { delegateStatement: string }
    ).delegateStatement;
    truncatedStatement = delegateStatement.slice(0, 120);
  }

  return (
    <>
      {!delegateStatement ? (
        <VStack gap={4} className="h-full w-[300px] p-2">
          <VStack gap={4} justifyContent="justify-center">
            <HStack gap={4} justifyContent="justify-start">
              <div className="w-14 h-14 rounded-full bg-gray-300 animate-pulse" />
              <VStack gap={2} justifyContent="justify-center">
                <div className="w-24 h-4 rounded-md bg-gray-300 animate-pulse" />
                <div className="w-12 h-4 rounded-md bg-gray-300 animate-pulse" />
              </VStack>
            </HStack>
            <div className="w-full h-12 rounded-md bg-gray-300 animate-pulse" />
          </VStack>
        </VStack>
      ) : (
        <VStack gap={4} className="h-full w-[300px]">
          <Link href={`/delegates/${address}`}>
            <VStack gap={4} justifyContent="justify-center">
              <DelegateProfileImage
                address={address}
                votingPower={!!delegate ? delegate.votingPower : "0"}
              />
              <p
                className={`break-words text-gray-600 overflow-hidden line-clamp-2 text-ellipsis`}
              >
                {truncatedStatement}
              </p>
            </VStack>
          </Link>
          <div className="flex-grow" />
          <HStack alignItems="items-stretch" className={"justify-between"}>
            <DelegateSocialLinks
              discord={delegateStatement.discord}
              twitter={delegateStatement.twitter}
            />
            <div>
              {!!delegate &&
                isConnected &&
                connectedAddress &&
                (isAdvancedUser ? (
                  <AdvancedDelegateButton
                    delegate={delegate}
                    delegators={delegators}
                  />
                ) : (
                  <DelegateButton
                    full={
                      !delegateStatement.twitter && !delegateStatement.discord
                    }
                    delegate={delegate}
                  />
                ))}
            </div>
          </HStack>
        </VStack>
      )}
    </>
  );
}
