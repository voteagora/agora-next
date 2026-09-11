"use client";

import { useAccount, useEnsName } from "wagmi";
import { mainnet } from "wagmi/chains";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useConnectModal } from "@/components/providers/ConnectModalContext";
import { privyDebugLog } from "@/lib/privyDebug";
import { WalletIcon } from "@/icons/walletIcon";
import { MobileProfileDropDown } from "./MobileProfileDropDown";

export function MobileConnectButton() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address, chainId: mainnet.id });
  const { openConnectModal, isConnecting } = useConnectModal();

  return (
    <div className="md:hidden flex items-center opacity-100 transition-all ">
      {isConnected ? (
        <MobileProfileDropDown ensName={ensName ?? undefined} />
      ) : isConnecting ? (
        <LoadingSpinner className="h-6 w-6 text-primary" />
      ) : (
        <div
          onClick={() => {
            privyDebugLog("MobileConnectButton.click", {
              isConnected,
              isConnecting,
              address,
            });
            openConnectModal();
          }}
        >
          <WalletIcon className="stroke-primary" />
        </div>
      )}
    </div>
  );
}
