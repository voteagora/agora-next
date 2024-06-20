"use client";

import { ConnectKitButton } from "connectkit";
import Image from "next/image";
import walletIcon from "@/icons/wallet.svg";
import { MobileProfileDropDown } from "./MobileProfileDropDown";

export function MobileConnectButton() {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
        return (
          <div className="sm:hidden flex items-center opacity-100 transition-all active:opacity-60 ">
            {isConnected ? (
              <MobileProfileDropDown ensName={ensName} />
            ) : (
              <div onClick={show}>
                <Image
                  height={walletIcon.height}
                  width={walletIcon.width}
                  src={walletIcon.src}
                  alt="Wallet"
                />
              </div>
            )}
          </div>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
