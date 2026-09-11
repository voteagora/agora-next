"use client";

import { useAccount, useEnsName } from "wagmi";
import { mainnet } from "wagmi/chains";
import { DesktopProfileDropDown } from "./DesktopProfileDropDown";
import { ArrowRight } from "@/icons/ArrowRight";
import { cn } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";
import EncourageDelegationDot from "./EncourageDelegationDot";
import { WalletIcon } from "@/icons/walletIcon";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useConnectModal } from "@/components/providers/ConnectModalContext";
import { privyDebugLog } from "@/lib/privyDebug";

export function DesktopConnectButton() {
  const { ui } = Tenant.current();
  const isDelegationEncouragementEnabled = ui.toggle(
    "delegation-encouragement"
  )?.enabled;
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address, chainId: mainnet.id });
  const { openConnectModal, isConnecting } = useConnectModal();

  return (
    <div
      data-testid="connect-wallet-button"
      onClick={() => {
        privyDebugLog("DesktopConnectButton.click", {
          isConnected,
          isConnecting,
          address,
        });
        if (!isConnected && !isConnecting) openConnectModal();
      }}
      className={cn(
        `lg:border text-primary font-medium lg:bg-neutral p-0 lg:px-4 lg:py-2 rounded-full cursor-pointer hidden md:flex items-center transition-all hover:lg:shadow-newDefault h-[48px] relative border-line`
      )}
      style={
        ui.customization?.buttonBackground
          ? {
              backgroundColor: `rgb(${ui.customization.buttonBackground})`,
            }
          : {}
      }
    >
      {isConnected ? (
        <>
          <DesktopProfileDropDown ensName={ensName ?? undefined} />
          {isDelegationEncouragementEnabled && (
            <EncourageDelegationDot className="left-8 top-[10px]" />
          )}
        </>
      ) : isConnecting ? (
        <LoadingSpinner className="h-5 w-5 text-primary" />
      ) : (
        <>
          <div className="lg:contents hidden">
            {"Connect "}
            <div className="hidden lg:inline-block"> {"Wallet"}</div>
            <ArrowRight className="ml-3 mr-1 stroke-primary" />
          </div>
          <div className="contents lg:hidden">
            {" "}
            <WalletIcon className="stroke-primary" />
          </div>
        </>
      )}
    </div>
  );
}
