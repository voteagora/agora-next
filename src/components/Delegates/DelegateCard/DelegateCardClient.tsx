"use client";

import { DelegateActions } from "./DelegateActions";
import useIsAdvancedUser from "@/app/lib/hooks/useIsAdvancedUser";
import { fetchCurrentDelegators } from "@/app/delegates/actions";
import { DelegateChunk } from "../DelegateCardList/DelegateCardList";
import { Delegation } from "@/app/api/common/delegations/delegation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function DelegateCardClient({
  delegate,
}: {
  delegate: DelegateChunk;
}) {
  const { isAdvancedUser } = useIsAdvancedUser();
  const { address } = useAccount();
  const [delegators, setDelegators] = useState<Delegation[] | null>(null);

  const fetchDelegatorsAndSet = async (addressOrENSName: string) => {
    let fetchedDelegators;
    try {
      fetchedDelegators = await fetchCurrentDelegators(addressOrENSName);
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
      isAdvancedUser={isAdvancedUser}
      delegators={delegators}
    />
  );
}
