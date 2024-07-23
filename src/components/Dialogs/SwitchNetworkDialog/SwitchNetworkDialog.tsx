import { useNetwork, useSwitchNetwork } from "wagmi";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { ChainConstants } from "viem/types/chain";
import Image from "next/image";
import Tenant from "@/lib/tenant/tenant";

export function SwitchNetwork({
  chain,
  closeDialog,
}: {
  chain: ChainConstants;
  closeDialog: () => void;
}) {
  const { ui } = Tenant.current();
  const { chain: connectedChain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    if (connectedChain?.id === chain.id) {
      closeDialog();
    }
  }, [connectedChain?.id, chain.id, closeDialog]);

  return (
    <div className="flex flex-col gap-4">
      <Image src={ui.assets.pending} className="w-full" alt="Switch Network" />
      <h1 className="text-2xl font-extrabold text-primary">Switch Networks</h1>
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
