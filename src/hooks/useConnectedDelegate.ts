import { Delegate } from "@/app/api/common/delegates/delegate";
import {
  fetchAllDelegatorsInChainsForAddress,
  fetchDelegate,
} from "@/app/delegates/actions";
import { OptimismContracts } from "@/lib/contracts/contracts";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useConnectButtonContext } from "@/contexts/ConnectButtonContext";

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const useConnectedDelegate = () => {
  const { address } = useAccount();
  const [delegate, setDelegate] = useState<Delegate | null>(null);
  const [advancedDelegators, setAdvancedDelegators] = useState<string[] | null>(
    null
  );
  const [balance, setBalance] = useState<bigint | null>(null);
  const [lastVotingPower, setLastVotingPower] = useState<string | null>(null);
  const [retries, setRetries] = useState(0);
  const { refetchDelegate, setRefetchDelegate } = useConnectButtonContext();

  const refetchData = useCallback(async (address: string) => {
    // When refetchDelegate is true, if last voting power is equal to actual it means indexer has not indexed the
    // new voting power
    if (
      refetchDelegate && delegate &&
      delegate.votingPower === lastVotingPower &&
      retries < 3
    ) {
      const _delegate = await fetchDelegate(address);
      // TODO: frh -> check this
      console.log('how many times _delegate: ', _delegate);
      setLastVotingPower(_delegate.votingPower);
      if (_delegate.votingPower !== lastVotingPower) {
        console.log("no more retries");
        setDelegate(_delegate);
        setRefetchDelegate(false);
        setRetries(0);
      } else {
        console.log("fetch retries", retries);
        await timeout(3000);
        const _retries = retries + 1;
        setRetries(_retries);
      }
    }
  }, [delegate, refetchDelegate, setRefetchDelegate, lastVotingPower, retries]);

  const fetchDelegateAndSet = useCallback(async (address: string) => {
    if (address) {
      const delegate = await fetchDelegate(address);
      console.log('delegate: ', delegate);
      setLastVotingPower(delegate.votingPower);
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
      if (refetchDelegate) {
        refetchData(address);
      }
    }
  }, [
    address,
    fetchDelegateAndSet,
    fetchAdvancedDelegatorsAndSet,
    fetchBalance,
    refetchData,
    refetchDelegate
  ]);

  return { delegate, advancedDelegators, balance };
};

export default useConnectedDelegate;
