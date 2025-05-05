import { ConnectKitButton } from "connectkit";
import { DesktopProfileDropDown } from "./DesktopProfileDropDown";
import { ArrowRight } from "@/icons/ArrowRight";
import { cn } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";
import EncourageDelegationDot from "./EncourageDelegationDot";

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
              "border text-primary lg:bg-neutral py-2 px-4 rounded-full cursor-pointer hidden sm:flex items-center transition-all hover:shadow-newDefault h-[48px] relative",
              isConnected ? "border-line" : "border-primary"
            )}
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
                {"Connect\u00A0"}
                <div className="hidden lg:inline-block"> {"Wallet"}</div>
                <ArrowRight className="ml-3 mr-1 stroke-primary" />
              </>
            )}
          </div>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
