"use client";

import { ConnectKitButton } from "connectkit";
import { WalletIcon } from "@/icons/walletIcon";
import { MobileProfileDropDown } from "./MobileProfileDropDown";

export function MobileConnectButton() {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, ensName }) => {
        return (
          <div className="md:hidden flex items-center opacity-100 transition-all ">
            {isConnected ? (
              <MobileProfileDropDown ensName={ensName} />
            ) : (
              <div onClick={show}>
                <WalletIcon className="stroke-primary" />
              </div>
            )}
          </div>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
