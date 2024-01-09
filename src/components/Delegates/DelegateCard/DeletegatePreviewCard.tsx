"use client";

import * as React from "react";
import { VStack } from "../../Layout/Stack";
import { DelegateActions } from "../DelegateCard/DelegateActions";
import { DelegateProfileImage } from "../DelegateCard/DelegateProfileImage";
import { useRouter } from "next/navigation";

interface Props {
  delegate: any; //todo any
  truncatedStatement: string;
  fetchBalanceForDirectDelegation: (
    addressOrENSName: string
  ) => Promise<string>;
  fetchVotingPowerForSubdelegation: (
    addressOrENSName: string
  ) => Promise<string>;
  checkIfDelegatingToProxy: (addressOrENSName: string) => Promise<boolean>;
  fetchCurrentDelegatees: (addressOrENSName: string) => Promise<any>;
  getProxyAddress: (addressOrENSName: string) => Promise<string>;
  isAdvancedUser: boolean;
}

export default function DelegatePreviewCard({
  delegate,
  truncatedStatement,
  fetchBalanceForDirectDelegation,
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
  getProxyAddress,
  isAdvancedUser,
}: Props) {

  const router = useRouter();

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    href: string
  ) => {
    e.preventDefault();
    router.push(href);
  };

return (
  <VStack
    className={`cursor-pointer border-gray-300 border rounded-xl bg-white shadow-sm p-6 h-full`}
    >
    <VStack gap={4} className="h-full">
      <div
        onClick={(e) =>
          handleClick(e, `/delegates/${delegate.address}`)
        }
      >
        <VStack gap={4} justifyContent="justify-center">
          <DelegateProfileImage
            address={delegate.address}
            votingPower={delegate.votingPower}
          />
          <p
            className={`break-words text-gray-600 overflow-hidden line-clamp-2`}>
            {truncatedStatement}
          </p>
        </VStack>
      </div>
      <div className="flex-grow" />
      <DelegateActions
        delegate={delegate}
        fetchBalanceForDirectDelegation={
          fetchBalanceForDirectDelegation
        }
        fetchVotingPowerForSubdelegation={
          fetchVotingPowerForSubdelegation
        }
        checkIfDelegatingToProxy={checkIfDelegatingToProxy}
        fetchCurrentDelegatees={fetchCurrentDelegatees}
        getProxyAddress={getProxyAddress}
        isAdvancedUser={isAdvancedUser}
      />
    </VStack>
  </VStack>
  )
}