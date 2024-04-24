import {
  fetchConnectedDelegate,
  revalidateDelegateAddressPage,
} from "@/app/delegates/actions";
import { useAccount } from "wagmi";
import { useState } from "react";
import { useConnectButtonContext } from "@/contexts/ConnectButtonContext";
import { useQuery } from "@tanstack/react-query";
import { fetchDelegate } from "@/app/delegates/actions";

/**
 * Define maximum number of retries, max retries 10 means 180 seconds waiting in total (advanced delegation voting power
 * takes around 120 seconds to update)
 */
const MAX_RETRIES = 10;

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// TODO: think about strategy to fetch, since balance and voting power can change on every block,
// also to prevent additional unnecessary fetches being done right now
const useConnectedDelegate = () => {
  const { refetchDelegate, setRefetchDelegate } = useConnectButtonContext();
  const { address } = useAccount();
  const [retries, setRetries] = useState<number>(0);
  const [lastVotingPower, setLastVotingPower] = useState<string | null>(null);

  const data = useQuery({
    enabled: !!address,
    queryKey: ["useConnectedDelegate", address, refetchDelegate, retries],
    queryFn: async () => {
      const [delegate, advancedDelegators, balance] =
        await fetchConnectedDelegate(address!);
      if (refetchDelegate) {
        revalidateDelegateAddressPage(refetchDelegate.address);
      }
      setLastVotingPower(delegate.votingPower);

      // If refetchDelegate?.votingPower we are looking for a revalidation on the page of the delegatee
      if (refetchDelegate?.prevVotingPowerDelegatee) {
        const delegatee = await fetchDelegate(refetchDelegate.address);
        /**
         * Materialized view that brings the new voting power takes one minute to sync
         * Refetch delegate will be set to null by the delegateProfileImage
         */
        if (
          delegatee.votingPower === refetchDelegate.prevVotingPowerDelegatee
        ) {
          // Check if maximum retries has been reached
          if (retries < MAX_RETRIES) {
            // Implement exponential backoff
            await timeout(2000 * (retries + 1));
            const _retries = retries + 1;
            setRetries(_retries);
          } else {
            // Handle maximum retries reached
            console.error("Maximum retries reached");
          }
        }
        return { delegate, advancedDelegators, balance };
      } else if (refetchDelegate) {
        // When refetchDelegate is true, if last voting power is equal to actual it means indexer has not indexed the
        // new voting power
        if (delegate.votingPower === lastVotingPower) {
          // Check if maximum retries has been reached
          if (retries < MAX_RETRIES) {
            // Implement exponential backoff
            await timeout(2000 * (retries + 1));
            const _retries = retries + 1;
            setRetries(_retries);
          } else {
            // Handle maximum retries reached
            console.error("Maximum retries reached");
          }
        } else {
          setRefetchDelegate(null);
        }
        return { delegate, advancedDelegators, balance };
      } else {
        return { delegate, advancedDelegators, balance };
      }
    },
  });

  return data.data
    ? {
        ...data.data,
        isLoading: data.isLoading,
      }
    : {
        balance: null,
        delegate: null,
        advancedDelegators: null,
        isLoading: data.isLoading,
      };
};

export default useConnectedDelegate;
