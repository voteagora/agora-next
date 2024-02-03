import { ConnectKitButton } from "connectkit";
import styles from "./header.module.scss";
import { Delegate } from "@/app/api/delegates/delegate";
import { DesktopProfileDropDown } from "./DesktopProfileDropDown";

export function DesktopConnectButton({
  delegate,
}: {
  delegate: Delegate | undefined;
}) {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
        return (
          <div
            onClick={!isConnected ? () => show?.() : undefined}
            className={styles.desktop_connect_button}
          >
            {isConnected ? (
              <DesktopProfileDropDown ensName={ensName} delegate={delegate} />
            ) : (
              "Connect Wallet"
            )}
          </div>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
