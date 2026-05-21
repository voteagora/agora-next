"use client";

import { useAccount } from "wagmi";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useModal } from "connectkit";

export const RedirectOrConnect = () => {
  const navigate = useNavigate();
  const { setOpen } = useModal();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (address && isConnected) {
      navigate({ to: `/staking/${address}` as never });
    }
  }, [address, isConnected, navigate]);

  return (
    <Button
      className="mt-3 text-neutral bg-brandPrimary"
      onClick={() => setOpen(true)}
    >
      Connect wallet to delegate
    </Button>
  );
};
