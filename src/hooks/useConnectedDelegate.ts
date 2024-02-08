import { Delegate } from "@/app/api/common/delegates/delegate";
import {
  fetchAllDelegatorsInChainsForAddress,
  fetchDelegate,
} from "@/app/delegates/actions";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";

const useConnectedDelegate = () => {
  const { address } = useAccount();
  const [delegate, setDelegate] = useState<Delegate | null>(null);
  const [advancedDelegators, setAdvancedDelegators] = useState<string[] | null>(
    null
  );

  const fetchDelegateAndSet = useCallback(async (address: string) => {
    if (address) {
      const delegate = await fetchDelegate(address);
      setDelegate(delegate);
    }
  }, []);

  const fetchAdvancedDelegatorsAndSet = useCallback(
    async (addressOrENSName: string) => {
      const fetchedDelegators = await fetchAllDelegatorsInChainsForAddress(
        addressOrENSName
      );
      setAdvancedDelegators(fetchedDelegators);
    },
    []
  );

  useEffect(() => {
    if (address) {
      fetchDelegateAndSet(address);
      fetchAdvancedDelegatorsAndSet(address);
    }
  }, [address, fetchDelegateAndSet, fetchAdvancedDelegatorsAndSet]);

  return { delegate, advancedDelegators };
};

export default useConnectedDelegate;
