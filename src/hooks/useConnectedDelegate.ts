import { Delegate } from "@/app/api/common/delegates/delegate";
import {
  fetchAllDelegatorsInChainsForAddress,
  fetchDelegate,
} from "@/app/delegates/actions";
import { OptimismContracts } from "@/lib/contracts/contracts";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";

const useConnectedDelegate = () => {
  const { address } = useAccount();
  const [delegate, setDelegate] = useState<Delegate | null>(null);
  const [advancedDelegators, setAdvancedDelegators] = useState<string[] | null>(
    null
  );
  const [balance, setBalance] = useState<bigint | null>(null);

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

  const fetchBalance = useCallback(async (address: string) => {
    const balance = await OptimismContracts.token.contract.balanceOf(address);
    setBalance(balance);
  }, []);

  useEffect(() => {
    if (address) {
      fetchDelegateAndSet(address);
      fetchAdvancedDelegatorsAndSet(address);
      fetchBalance(address);
    }
  }, [
    address,
    fetchDelegateAndSet,
    fetchAdvancedDelegatorsAndSet,
    fetchBalance,
  ]);

  return { delegate, advancedDelegators, balance };
};

export default useConnectedDelegate;
