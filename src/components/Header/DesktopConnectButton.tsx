import { ConnectKitButton } from "connectkit";
import { DesktopProfileDropDown } from "./DesktopProfileDropDown";
import { ArrowRight } from "@/icons/ArrowRight";
import { cn } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";
import EncourageDelegationDot from "./EncourageDelegationDot";
import { WalletIcon } from "@/icons/walletIcon";

export function DesktopConnectButton() {
  const { ui } = Tenant.current();
  const isDelegationEncouragementEnabled = ui.toggle(
    "delegation-encouragement"
  )?.enabled;

  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, ensName }) => {
        return (
          <div
            onClick={!isConnected ? () => show?.() : undefined}
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
                <DesktopProfileDropDown ensName={ensName} />
                {isDelegationEncouragementEnabled && (
                  <EncourageDelegationDot className="left-8 top-[10px]" />
                )}
              </>
            ) : (
              <>
                <div className="lg:contents hidden">
                  {"Connect\u00A0"}
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
      }}
    </ConnectKitButton.Custom>
  );
}
