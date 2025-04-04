import { ConnectKitButton } from "connectkit";
import { DesktopProfileDropDown } from "./DesktopProfileDropDown";
import { ArrowRight } from "@/icons/ArrowRight";

export function DesktopConnectButton() {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, ensName }) => {
        return (
          <div
            onClick={!isConnected ? () => show?.() : undefined}
            className="border border-primary text-primary font-bold bg-neutral py-2 px-4 rounded-full cursor-pointer hidden sm:flex items-center transition-all hover:shadow-newDefault h-[48px]"
          >
            {isConnected ? (
              <DesktopProfileDropDown ensName={ensName} />
            ) : (
              <>
                {"Connect Wallet"} <ArrowRight className="ml-3 mr-1" />
              </>
            )}
          </div>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
