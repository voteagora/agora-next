"use client";

import { Delegation } from "@/app/api/delegations/delegation";
import { DelegateChunk } from "../DelegateCardList/DelegateCardList";
import { DelegateActions } from "./DelegateActions";
import useIsAdvancedUser from "@/app/lib/hooks/useIsAdvancedUser";
import { Delegatees } from "@prisma/client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

type Props = {
  delegate: DelegateChunk;
  fetchBalanceForDirectDelegation: (
    addressOrENSName: string
  ) => Promise<string>;
  fetchVotingPowerForSubdelegation: (
    addressOrENSName: string
  ) => Promise<string>;
  checkIfDelegatingToProxy: (addressOrENSName: string) => Promise<boolean>;
  fetchCurrentDelegatees: (addressOrENSName: string) => Promise<Delegation[]>;
  getProxyAddress: (addressOrENSName: string) => Promise<string>;
  fetchDirectDelegatee: (addressOrENSName: string) => Promise<Delegatees>;
  getDelegators: (addressOrENSName: string) => Promise<Delegation[] | null>;
};

export default function DelegateCardClient({
  delegate,
  fetchBalanceForDirectDelegation,
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
  getProxyAddress,
  fetchDirectDelegatee,
  getDelegators,
}: Props) {
  const { isAdvancedUser } = useIsAdvancedUser();
  const { address } = useAccount();
  const [delegators, setDelegators] = useState<Delegation[] | null>(null);

  const fetchDelegatorsAndSet = async (addressOrENSName: string) => {
    let fetchedDelegators;
    try {
      fetchedDelegators = await getDelegators(addressOrENSName);
    } catch (error) {
      fetchedDelegators = null;
    }
    setDelegators(fetchedDelegators);
  };

  useEffect(() => {
    if (address) {
      fetchDelegatorsAndSet(address);
    } else {
      setDelegators(null);
    }
  }, [address]);

  return (
    <DelegateActions
      delegate={delegate}
      fetchBalanceForDirectDelegation={fetchBalanceForDirectDelegation}
      fetchVotingPowerForSubdelegation={fetchVotingPowerForSubdelegation}
      checkIfDelegatingToProxy={checkIfDelegatingToProxy}
      fetchCurrentDelegatees={fetchCurrentDelegatees}
      getProxyAddress={getProxyAddress}
      isAdvancedUser={isAdvancedUser}
      fetchDirectDelegatee={fetchDirectDelegatee}
      delegators={delegators}
    />
  );
}
