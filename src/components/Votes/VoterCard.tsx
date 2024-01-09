"use client";

import React, { useEffect, useState } from 'react';
import { VStack, HStack } from "@/components/Layout/Stack";
import { DelegateActions } from "../Delegates/DelegateCard/DelegateActions";
import { DelegateProfileImage } from '../Delegates/DelegateCard/DelegateProfileImage';
import { useRouter } from "next/navigation";

interface Props {
  address: string;
  fetchDelegate: (addressOrENSName: string) => Promise<any>;
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

export default function VoterCard({
  address,
  fetchDelegate,
  fetchBalanceForDirectDelegation,
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
  getProxyAddress,
  isAdvancedUser,
}: Props) {

  const router = useRouter();
  const [delegate, setDelegate] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    href: string
  ) => {
    e.preventDefault();
    router.push(href);
  };

  const fetchDelegateAndSet = async (addressOrENSName: string) => {
    const delegate = await fetchDelegate(addressOrENSName);
    console.log('delegate', delegate);
    setLoading(false);
    setDelegate(delegate);

    let truncatedStatement = "";

          if (delegate.statement && delegate.statement.delegateStatement) {
            truncatedStatement = delegate.statement.delegateStatement.slice(
              0,
              120
            );
          }
  }

  useEffect(() => {
    fetchDelegateAndSet(address);
  }, []);

return (
  <>
  {loading ? (
    <p>Loading...</p>
  ) : (
    <VStack gap={4} className="h-full w-[300px]">
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
            className={`break-words text-gray-600 overflow-hidden line-clamp-2 text-ellipsis`}>
            {delegate.statement?.delegateStatement && `${delegate.statement?.delegateStatement.slice(0, 120)}`}
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
  )}
</>
  )
}