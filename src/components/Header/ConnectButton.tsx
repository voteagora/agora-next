"use client";

import { MobileConnectButton } from "./MobileConnectButton";
import { DesktopConnectButton } from "./DesktopConnectButton";
import { useNetwork } from "wagmi";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useEffect } from "react";
import { OptimismContracts } from "@/lib/contracts/contracts";

export function ConnectButton() {
  const { chainId } = OptimismContracts.governor;
  const { chain } = useNetwork();
  const openDialog = useOpenDialog();

  useEffect(() => {
    if (chain?.id && chain.id !== chainId) {
      openDialog({
        type: "SWITCH_NETWORK",
        params: {
          chainId,
        },
      });
    }
  }, [chain?.id, chainId, openDialog]);

  return (
    <div>
      <MobileConnectButton />
      <DesktopConnectButton />
    </div>
  );
}
