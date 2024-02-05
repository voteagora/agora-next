"use client";

import { ConnectKitButton } from "connectkit";
import styles from "./header.module.scss";
import Image from "next/image";
import walletIcon from "@/icons/wallet.svg";
import { MobileProfileDropDown } from "./MobileProfileDropDown";
import { Delegate } from "@/app/api/common/delegates/delegate";

type Props = {
  delegate: Delegate | undefined;
};

export function MobileConnectButton({ delegate }: Props) {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
        return (
          <div className={styles.mobile_connect_button}>
            {isConnected ? (
              <MobileProfileDropDown ensName={ensName} delegate={delegate} />
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
