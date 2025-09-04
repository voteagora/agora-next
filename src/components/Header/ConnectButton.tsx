"use client";

import { MobileConnectButton } from "./MobileConnectButton";
import { DesktopConnectButton } from "./DesktopConnectButton";
import { useAccount } from "wagmi";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useEffect } from "react";
import Tenant from "@/lib/tenant/tenant";

export function ConnectButton() {
  const { contracts } = Tenant.current();
  const { chainId, address } = useAccount();
  const openDialog = useOpenDialog();

  useEffect(() => {
    if (!address) return;
    if (chainId !== contracts.token.chain.id) {
      openDialog({
        type: "SWITCH_NETWORK",
        params: {
          chain: contracts.token.chain,
        },
      });
    }
  }, [
    address,
    chainId,
    contracts.token.chain,
    contracts.token.chain.id,
    openDialog,
  ]);

  return (
    <div>
      <MobileConnectButton />
      <DesktopConnectButton />
    </div>
  );
}
