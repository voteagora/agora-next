import { useSwitchNetwork } from "wagmi";
import { Button } from "@/components/ui/button";

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
  const { switchNetwork } = useSwitchNetwork();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Switch Networks</h1>
      <p>Wrong network detected, switch to Optimism to continue.</p>
      <Button
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
