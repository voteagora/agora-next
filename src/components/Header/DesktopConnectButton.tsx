import { ConnectKitButton } from "connectkit";
import { DesktopProfileDropDown } from "./DesktopProfileDropDown";
import { ArrowRight } from "@/icons/ArrowRight";
import { cn } from "@/lib/utils";

export function DesktopConnectButton() {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, ensName }) => {
        return (
          <div
            onClick={!isConnected ? () => show?.() : undefined}
            className={cn(
              "border-none lg:border border-solid text-primary lg:bg-neutral p-0 lg:px-4 lg:py-2 rounded-full cursor-pointer hidden md:flex items-center transition-all hover:shadow-newDefault h-[48px]",
              isConnected ? "border-line" : "border-primary"
            )}
          >
            {isConnected ? (
              <DesktopProfileDropDown ensName={ensName} />
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
