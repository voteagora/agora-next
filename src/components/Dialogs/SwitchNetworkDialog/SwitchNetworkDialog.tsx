import { useNetwork, useSwitchNetwork, useChainId } from "wagmi";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import Tenant from "@/lib/tenant/tenant";

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
      <img
        src="/images/action-pending.svg"
        className="w-full"
        alt="Switch netwrok"
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
