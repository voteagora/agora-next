"use client";

import { MobileConnectButton } from "./MobileConnectButton";
import { DesktopConnectButton } from "./DesktopConnectButton";
import { useNetwork } from "wagmi";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useEffect } from "react";
import { useModal } from "connectkit";

export function ConnectButton() {
  const chainIdMainnet = 1;
  const chainIdOP = 10;
  const { chain } = useNetwork();
  const openDialog = useOpenDialog();
  const { setOpen } = useModal();

  useEffect(() => {
    if (chain?.id === chainIdMainnet) {
      setOpen(false);
      openDialog({
        type: "SWITCH_NETWORK",
        params: {
          chainId: chainIdOP,
        },
      });
    }
  }, [chain?.id, openDialog]);

  return (
    <div>
      <MobileConnectButton />
      <DesktopConnectButton />
    </div>
  );
}
