import {
  fetchConnectedDelegate,
  revalidateDelegateAddressPage,
} from "@/app/delegates/actions";
import { useAccount } from "wagmi";
import { useState } from "react";
import { useConnectButtonContext } from "@/contexts/ConnectButtonContext";
import { fetchDelegate } from "@/app/delegates/actions";
import { useQuery } from "@tanstack/react-query";

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// TODO: think about strategy to fetchConnectedDelegate, since balance and voting power can change on every block,
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
          await timeout(2000);
          const _retries = retries + 1;
          setRetries(_retries);
        }
        return { delegate, advancedDelegators, balance };
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
