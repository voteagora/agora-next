"use client";

import { MobileConnectButton } from "./MobileConnectButton";
import { DesktopConnectButton } from "./DesktopConnectButton";
import { useNetwork } from "wagmi";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useEffect } from "react";
import Tenant from "@/lib/tenant/tenant";

export function ConnectButton() {
  const { contracts } = Tenant.current();
  const { chainId } = contracts.token;
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
