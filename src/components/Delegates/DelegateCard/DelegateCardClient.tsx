"use client";

import { Delegation } from "@/app/api/delegations/delegation";
import { DelegateChunk } from "../DelegateCardList/DelegateCardList";
import { DelegateActions } from "./DelegateActions";
import useIsAdvancedUser from "@/app/lib/hooks/useIsAdvancedUser";
import { Delegatees } from "@prisma/client";

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
};

export default function DelegateCardClient({
  delegate,
  fetchBalanceForDirectDelegation,
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
  getProxyAddress,
  fetchDirectDelegatee,
}: Props) {
  const { isAdvancedUser } = useIsAdvancedUser();

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
    />
  );
}
