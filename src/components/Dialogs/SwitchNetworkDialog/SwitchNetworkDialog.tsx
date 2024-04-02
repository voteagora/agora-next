import { useNetwork, useSwitchNetwork } from "wagmi";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import loadingSvg from "@/assets/tenant/optimism-loading.svg";
import Tenant from "@/lib/tenant/tenant";
import Image from "next/image";

export function SwitchNetwork({
  chainId,
  closeDialog,
}: {
  chainId: number;
  closeDialog: () => void;
}) {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { contracts } = Tenant.current();

  useEffect(() => {
    if (chain?.id === chainId) {
      closeDialog();
    }
  }, [chain?.id, chainId, closeDialog]);

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
      <p>
        Wrong network detected, switch to {contracts.token.chainName} to
        continue.
      </p>
      <Button
        variant="outline"
        className="font-bold"
        onClick={() => {
          switchNetwork?.(chainId);
          closeDialog();
        }}
      >
        Switch to {contracts.token.chainName}
      </Button>
    </div>
  );
}
