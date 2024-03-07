import { fetchConnectedDelegate, revalidateDelegateAddressPage } from "@/app/delegates/actions";
import { useAccount } from "wagmi";
import { Delegate } from "@/app/api/common/delegates/delegate";
import { useState, useCallback, useEffect } from "react";
import { useConnectButtonContext } from "@/contexts/ConnectButtonContext";
import { fetchDelegate } from "@/app/delegates/actions";

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
        revalidateDelegateAddressPage(refetchDelegate.address);
      }
      setLastVotingPower(delegate.votingPower);
      setDelegate(delegate);
      setAdvancedDelegators(advancedDelegators);
      setBalance(balance);

      // If refetchDelegate?.votingPower we are looking for a revalidation on the page of the delegatee
      if (refetchDelegate?.prevVotingPowerDelegatee) {
        const delegatee = await fetchDelegate(refetchDelegate.address);
        /**
         * Materialized view that brings the new voting power takes one minute to sync
         * Refetch delegate will be set to null by the delegateProfileImage
         */
        if (delegatee.votingPower === refetchDelegate.prevVotingPowerDelegatee) {
          await timeout(2000);
          const _retries = retries + 1;
          setRetries(_retries);
        }
      } else if (refetchDelegate) {
        // When refetchDelegate is true, if last voting power is equal to actual it means indexer has not indexed the	
        // new voting power	
        if (delegate.votingPower === lastVotingPower) {
          await timeout(2000);
          const _retries = retries + 1;
          setRetries(_retries);
        } else {
          setRefetchDelegate(null);
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