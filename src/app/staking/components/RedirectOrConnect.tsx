"use client";

import { useAccount } from "wagmi";
import { useEffect } from "react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useConnectModal as useModal } from "@/components/providers/ConnectModalContext";

export const RedirectOrConnect = () => {
  const { openConnectModal } = useModal();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (address && isConnected) {
      redirect(`/staking/${address}`);
    }
  }, [address, isConnected]);

  return (
    <Button
      className="mt-3 text-neutral bg-brandPrimary"
      onClick={() => openConnectModal()}
    >
      Connect wallet to delegate
    </Button>
  );
};
