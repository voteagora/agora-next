import { useAccount, useSwitchChain } from "wagmi";
import { Button } from "@/components/Button";
import { useEffect } from "react";
import { Chain } from "viem/chains";
import Image from "next/image";
import Tenant from "@/lib/tenant/tenant";

export function SwitchNetwork({
  chain,
  closeDialog,
}: {
  chain: Chain;
  closeDialog: () => void;
}) {
  const { ui } = Tenant.current();
  const { chain: connectedChain } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (connectedChain?.id === chain.id) {
      closeDialog();
    }
  }, [connectedChain?.id, chain.id, closeDialog]);

  return (
    <div className="flex flex-col gap-4">
      <Image src={ui.assets.pending} className="w-full" alt="Switch Network" />
      <h1 className="text-2xl font-extrabold text-primary">Switch Networks</h1>
      <p className="text-secondary">
        Wrong network detected, switch to {chain.name} to continue.
      </p>
      <Button
        fullWidth
        className="font-bold"
        onClick={() => {
          switchChain?.({ chainId: chain.id });
          closeDialog();
        }}
      >
        Switch to {chain.name}
      </Button>
    </div>
  );
}
