"use client";

import { DelegateActions } from "./DelegateActions";
import useIsAdvancedUser from "@/app/lib/hooks/useIsAdvancedUser";
import { DelegateChunk } from "../DelegateCardList/DelegateCardList";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { fetchAllDelegatorsInChainsForAddress } from "@/app/delegates/actions";

export default function DelegateCardClient({
  delegate,
}: {
  delegate: DelegateChunk;
}) {
  const { isAdvancedUser } = useIsAdvancedUser();
  const { address } = useAccount();
  const [delegators, setDelegators] = useState<string[] | null>(null);

  const fetchDelegatorsAndSet = useCallback(
    async (addressOrENSName: string) => {
      const fetchedDelegators = await fetchAllDelegatorsInChainsForAddress(
        addressOrENSName
      );
      setDelegators(fetchedDelegators);
    },
    []
  );

  useEffect(() => {
    if (address) {
      fetchDelegatorsAndSet(address);
    } else {
      setDelegators(null);
    }
  }, [address, fetchDelegatorsAndSet]);

  return (
    <DelegateActions
      delegate={delegate}
      isAdvancedUser={isAdvancedUser}
      delegators={delegators}
    />
  );
}
