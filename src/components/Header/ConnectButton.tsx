"use client";

import { Delegate } from "@/app/api/delegates/delegate";
import { MobileConnectButton } from "./MobileConnectButton";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { DesktopConnectButton } from "./DesktopConnectButton";

type Props = {
  fetchDelegate: (address: string) => Promise<Delegate>;
};

export function ConnectButton({ fetchDelegate }: Props) {
  const [delegate, setDelegate] = useState<Delegate>();
  const { address } = useAccount();

  useEffect(() => {
    if (!address) return;

    async function fetchData(address: string) {
      const delegate = await fetchDelegate(address);
      setDelegate(delegate);
    }

    fetchData(address);
  }, [address, fetchDelegate]);

  return (
    <>
      <MobileConnectButton delegate={delegate} />
      <DesktopConnectButton delegate={delegate} />
    </>
  );
}
