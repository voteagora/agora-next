import { ConnectKitButton } from "connectkit";
import styles from "./header.module.scss";
import { DesktopProfileDropDown } from "./DesktopProfileDropDown";

export function DesktopConnectButton() {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
        return (
          <div
            onClick={!isConnected ? () => show?.() : undefined}
            className={styles.desktop_connect_button}
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
