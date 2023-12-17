// Header component
import Navbar from "./Navbar";
import { HStack, VStack } from "../Layout/Stack";
import LogoLink from "./LogoLink";
import styles from "./header.module.scss";
import { ConnectKitButton } from "connectkit";
import walletIcon from "@/icons/wallet.svg";
import Image from "next/image";

export default function Header() {
  return (
    <VStack>
      <HStack className="main_header" justifyContent="justify-between">
        <LogoLink instance_name="Optimism" />
        <Navbar />
        <ConnectButton />
      </HStack>
    </VStack>
  );
}

function ConnectButton() {
  return (
    // if mobile return mobile button
    // if desktop return desktop button
    <>
      <MobileConnectButton />
      <DesktopConnectButton />
    </>
  );
}

function MobileConnectButton() {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
        return (
          <button onClick={show} className={styles.mobile_connect_button}>
            {isConnected ? (
              address
            ) : (
              <Image
                height={walletIcon.height}
                width={walletIcon.width}
                src={walletIcon.src}
                alt="Wallet"
              />
            )}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}

function DesktopConnectButton() {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
        return (
          <button onClick={show} className={styles.desktop_connect_button}>
            {isConnected ? address : "Connect Wallet"}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
