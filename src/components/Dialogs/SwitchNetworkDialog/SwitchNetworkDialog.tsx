import { useNetwork, useSwitchNetwork } from "wagmi";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function SwitchNetwork({
  chainId,
  closeDialog,
}: {
  chainId: number;
  closeDialog: () => void;
}) {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    if (chain?.id === chainId) {
      closeDialog();
    }
  }, [chain?.id, chainId, closeDialog]);

  return (
    <div className="flex flex-col gap-4">
      <img src="/images/action-pending.svg" className="w-full" alt="Switch netwrok"/>
      <h1 className="text-2xl font-extrabold">Switch Networks</h1>
      <p>Wrong network detected, switch to Optimism to continue.</p>
      <Button
        variant="outline"
        className="font-bold"
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
