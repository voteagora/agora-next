"use client";

import { MobileConnectButton } from "./MobileConnectButton";
import { DesktopConnectButton } from "./DesktopConnectButton";
import { useAccount } from "wagmi";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useEffect } from "react";
import Tenant from "@/lib/tenant/tenant";

export function ConnectButton() {
  const { contracts } = Tenant.current();
  const { chain, address } = useAccount();
  const openDialog = useOpenDialog();

  useEffect(() => {
    if (!address) return;
    if (!chain || (chain?.id && chain.id !== contracts.token.chain.id)) {
      openDialog({
        type: "SWITCH_NETWORK",
        params: {
          chain: contracts.token.chain,
        },
      });
    }
  }, [
    chain?.id,
    contracts.token.chain.id,
    openDialog,
    address,
    chain,
    contracts.token.chain,
  ]);

  return (
    <div>
      <MobileConnectButton />
      <DesktopConnectButton />
    </div>
  );
}
