import { useNetwork, useSwitchNetwork } from "wagmi";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import loadingSvg from "@/assets/tenant/optimism-loading.svg";
import Tenant from "@/lib/tenant/tenant";
import Image from "next/image";
import { ChainConstants } from "viem/types/chain";

export function SwitchNetwork({
  chain,
  closeDialog,
}: {
  chain: ChainConstants;
  closeDialog: () => void;
}) {
  const { chain: connectedChain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    if (connectedChain?.id === chain.id) {
      closeDialog();
    }
  }, [connectedChain?.id, chain.id, closeDialog]);

  return (
    <div className="flex flex-col gap-4">
      <Image
        width="457"
        height="155"
        src={loadingSvg}
        className="w-full"
        alt="Switch network"
      />
      <h1 className="text-2xl font-extrabold">Switch Networks</h1>
      <p>Wrong network detected, switch to {chain.name} to continue.</p>
      <Button
        variant="outline"
        className="font-bold"
        onClick={() => {
          switchNetwork?.(chain.id);
          closeDialog();
        }}
      >
        Switch to {chain.name}
      </Button>
    </div>
  );
}
