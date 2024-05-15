"use client";

import { useAgoraContext } from "@/contexts/AgoraContext";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useModal } from "connectkit";

export const RedirectOrConnect = () => {
  const { setOpen } = useModal();
  const { isConnected } = useAgoraContext();
  const { address } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      redirect(`/staking/${address}`);
    }
  }, [isConnected, address]);

  return (
    <Button className="mt-3" onClick={() => setOpen(true)}>
      Connect wallet to delegate
    </Button>
  );
};
