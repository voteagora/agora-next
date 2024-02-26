"use client";

import { ConnectKitButton } from "connectkit";
import styles from "./header.module.scss";
import Image from "next/image";
import walletIcon from "@/icons/wallet.svg";
import { MobileProfileDropDown } from "./MobileProfileDropDown";

export function MobileConnectButton() {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
        return (
          <div className={styles.mobile_connect_button}>
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
