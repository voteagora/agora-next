"use client";

import { MobileConnectButton } from "./MobileConnectButton";
import { DesktopConnectButton } from "./DesktopConnectButton";
import { useAccount } from "wagmi";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useEffect } from "react";
import Tenant from "@/lib/tenant/tenant";
import { useGetDelegatees } from "@/hooks/useGetDelegatee";

export function ConnectButton() {
  const { contracts } = Tenant.current();
  const { chain, address } = useAccount();
  const openDialog = useOpenDialog();
  const { data: delegatees } = useGetDelegatees({ address });

  const hasNotDelegated = !delegatees?.length;

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
  }, [chain?.id, contracts.token.chain.id, openDialog]);

  return (
    <div>
      <MobileConnectButton hasNotDelegated={hasNotDelegated} />
      <DesktopConnectButton hasNotDelegated={hasNotDelegated} />
    </div>
  );
}
