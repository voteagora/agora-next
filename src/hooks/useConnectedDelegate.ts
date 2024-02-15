import { fetchConnectedDelegate, } from "@/app/delegates/actions";
import { useAccount } from "wagmi";
import { Delegate } from "@/app/api/common/delegates/delegate";
import { useState, useCallback, useEffect } from "react";

// TODO: think about strategy to refetchConnectedDelegate, since balance and voting power can change on every block
const useConnectedDelegate = () => {
  const { address } = useAccount();
  const [delegate, setDelegate] = useState<Delegate | null>(null);
  const [advancedDelegators, setAdvancedDelegators] = useState<string[] | null>(
    null
  );
  const [balance, setBalance] = useState<bigint | null>(null);

  const fetchDelegateAndSet = useCallback(async (address: string) => {
    if (address) {
      const [delegate, advancedDelegators, balance] = await fetchConnectedDelegate(address);
      setDelegate(delegate);
      setAdvancedDelegators(advancedDelegators);
      setBalance(balance);
    }
  }, []);

  useEffect(() => {
    if (address) {
      fetchDelegateAndSet(address);
    }
  }, [address, fetchDelegateAndSet]);

  return { delegate, advancedDelegators, balance };
};

export default useConnectedDelegate;
