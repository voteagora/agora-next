"use client";

import { Delegate } from "@/app/api/common/delegates/delegate";
import { MobileConnectButton } from "./MobileConnectButton";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { DesktopConnectButton } from "./DesktopConnectButton";
import { useConnectButtonContext } from "@/contexts/ConnectButtonContext";

type Props = {
  fetchDelegate: (address: string) => Promise<Delegate>;
};

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function ConnectButton({ fetchDelegate }: Props) {
  const [delegate, setDelegate] = useState<Delegate>();
  const [lastVotingPower, setLastVotingPower] = useState<string | null>(null);
  const [retries, setRetries] = useState(0);
  const { address } = useAccount();
  const { refetchDelegate, setRefetchDelegate } = useConnectButtonContext();

  useEffect(() => {
    if (!address) return;

    async function fetchData(address: string) {
      const delegate = await fetchDelegate(address);
      setLastVotingPower(delegate.votingPower);
      // When refetchDelegate is true, if last voting power is equal to actual it means indexer has not indexed the
      // new voting power
      if (
        refetchDelegate &&
        delegate.votingPower === lastVotingPower &&
        retries < 3
      ) {
        await timeout(3000);
        const _retries = retries + 1;
        setRetries(_retries);
        return;
      }
      setDelegate(delegate);
      setRefetchDelegate(false);
      setRetries(0);
    }

    if ((refetchDelegate === null || refetchDelegate) && retries < 3) {
      fetchData(address);
    }
  }, [
    address,
    fetchDelegate,
    refetchDelegate,
    setRefetchDelegate,
    lastVotingPower,
    retries,
  ]);

  return (
    <div>
      <MobileConnectButton />
      <DesktopConnectButton />
    </div>
  );
}
