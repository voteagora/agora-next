"use client";

import { ConnectKitButton } from "connectkit";
import { MobileConnectButton } from "./MobileConnectButton";
import { DesktopConnectButton } from "./DesktopConnectButton";
import { useAccount } from "wagmi";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useEffect } from "react";
import Tenant from "@/lib/tenant/tenant";
import { WalletIcon } from "@/icons/walletIcon";

export function ConnectButton({ isVibdaoLocalMode = false }: { isVibdaoLocalMode?: boolean }) {
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

  if (isVibdaoLocalMode) {
    return (
      <ConnectKitButton.Custom>
        {({ isConnected, show, truncatedAddress }) => (
          <button
            type="button"
            onClick={() => show?.()}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-neutral px-3 text-sm font-medium text-primary transition-all hover:shadow-newDefault"
          >
            <WalletIcon className="h-4 w-4 stroke-primary" />
            <span className="hidden sm:inline">
              {isConnected ? truncatedAddress || "Wallet" : "Connect"}
            </span>
          </button>
        )}
      </ConnectKitButton.Custom>
    );
  }

  return (
    <div>
      <MobileConnectButton />
      <DesktopConnectButton />
    </div>
  );
}
