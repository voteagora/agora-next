"use client";

import { MobileConnectButton } from "./MobileConnectButton";
import { DesktopConnectButton } from "./DesktopConnectButton";
import { useNetwork } from "wagmi";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useEffect } from "react";
import Tenant from "@/lib/tenant/tenant";

export function ConnectButton() {
  const { contracts } = Tenant.current();
  const { chain } = useNetwork();
  const openDialog = useOpenDialog();

  useEffect(() => {
    if (chain?.id && chain.id !== contracts.token.chain.id) {
      openDialog({
        type: "SWITCH_NETWORK",
        params: {
          chain: contracts.token.chain,
        },
      });
    }
  }, [chain?.id, contracts.token.chain.id, openDialog]);

  return (
    <div>
      <MobileConnectButton />
      <DesktopConnectButton />
    </div>
  );
}
