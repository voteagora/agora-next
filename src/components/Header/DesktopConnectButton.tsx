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
              "lg:border text-primary lg:bg-neutral py-2 px-4 rounded-full cursor-pointer hidden sm:flex items-center transition-all hover:shadow-newDefault h-[48px]",
              isConnected ? "lg:border-line" : "lg:border-primary"
            )}
          >
            {isConnected ? (
              <DesktopProfileDropDown ensName={ensName} />
            ) : (
              <>
                {"Connect Wallet"}{" "}
                <ArrowRight className="ml-3 mr-1 hidden lg:block stroke-primary" />
              </>
            )}
          </div>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
