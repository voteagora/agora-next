import { useNetwork, useSwitchNetwork } from "wagmi";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

/**
 * Function openSwitchNetworks from connectkit should not work here since we need mainnet to resolve ENS names.
 * However, mainnet should not be allowed for other write transactions and therefore this component.
 */
export function SwitchNetwork({
  chainId,
  closeDialog,
}: {
  chainId: number;
  closeDialog: () => void;
}) {
  const chainIdMainnet = 1;
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    if (chain?.id !== chainIdMainnet) {
      closeDialog();
    }
  }, [chain?.id, closeDialog]);

  return (
    <div className="flex flex-col gap-4">
      <img src="/images/action-pending.svg" className="w-full" />
      <h1 className="text-2xl font-extrabold">Switch Networks</h1>
      <p>Wrong network detected, switch to Optimism to continue.</p>
      <Button
        variant="outline"
        className="font-bold cursor-pointer"
        onClick={() => {
          switchNetwork?.(chainId);
          closeDialog();
        }}
      >
        Switch to Optimism
      </Button>
    </div>
  );
}
