"use client";

import { DelegateActions } from "./DelegateActions";
import useIsAdvancedUser from "@/app/lib/hooks/useIsAdvancedUser";

export default function DelegateCardClient({
  delegate,
  fetchBalanceForDirectDelegation,
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
  getProxyAddress,
}) {
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
    />
  );
}
