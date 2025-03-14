import { ConnectKitButton } from "connectkit";
import { DesktopProfileDropDown } from "./DesktopProfileDropDown";

export function DesktopConnectButton() {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, ensName }) => {
        return (
          <div
            onClick={!isConnected ? () => show?.() : undefined}
            className="border border-line text-primary font-medium bg-neutral py-2 px-4 rounded-full cursor-pointer hidden sm:flex items-center transition-all hover:shadow-newDefault"
          >
            {isConnected ? (
              <DesktopProfileDropDown ensName={ensName} />
            ) : (
              "Connect Wallet"
            )}
          </div>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
