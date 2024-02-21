import { fetchConnectedDelegate, revalidateDelegateAddressPage } from "@/app/delegates/actions";
import { useAccount } from "wagmi";
import { Delegate } from "@/app/api/common/delegates/delegate";
import { useState, useCallback, useEffect } from "react";
import { useConnectButtonContext } from "@/contexts/ConnectButtonContext";

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// TODO: think about strategy to fetchConnectedDelegate, since balance and voting power can change on every block, 
// also to prevent additional unnecessary fetches being done right now
const useConnectedDelegate = () => {
  const { refetchDelegate, setRefetchDelegate } = useConnectButtonContext();
  const { address } = useAccount();
  const [delegate, setDelegate] = useState<Delegate | null>(null);
  const [advancedDelegators, setAdvancedDelegators] = useState<string[] | null>(
    null
  );
  const [balance, setBalance] = useState<bigint | null>(null);
  const [retries, setRetries] = useState<number>(0);
  const [lastVotingPower, setLastVotingPower] = useState<string | null>(null);

  const fetchDelegateAndSet = useCallback(async (address: string) => {
    if (address) {
      const [delegate, advancedDelegators, balance] = await fetchConnectedDelegate(address);
      if (refetchDelegate) {
        revalidateDelegateAddressPage(refetchDelegate);
      }
      setLastVotingPower(delegate.votingPower);
      setDelegate(delegate);
      setAdvancedDelegators(advancedDelegators);
      setBalance(balance);
      // When refetchDelegate is true, if last voting power is equal to actual it means indexer has not indexed the	
      // new voting power	
      if (
        refetchDelegate &&
        retries < 3
      ) {
        if (delegate.votingPower === lastVotingPower) {
          await timeout(3000);
          const _retries = retries + 1;
          setRetries(_retries);
        } else {
          setRefetchDelegate(null);
          setRetries(0);
        }
      }
    }
  }, [lastVotingPower, refetchDelegate, retries, setRefetchDelegate]);

  useEffect(() => {
    if (address) {
      fetchDelegateAndSet(address);
    }
  }, [address, fetchDelegateAndSet]);

  return { delegate, advancedDelegators, balance };
};

export default useConnectedDelegate;