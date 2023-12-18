// Header component
import Navbar from "./Navbar";
import { HStack, VStack } from "../Layout/Stack";
import LogoLink from "./LogoLink";
import styles from "./header.module.scss";
import { ConnectKitButton } from "connectkit";
import walletIcon from "@/icons/wallet.svg";
import Image from "next/image";
import HumanAddress from "../shared/HumanAddress";
import ENSAvatar from "../shared/ENSAvatar";

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
              <div className={styles.testing}>
                <ENSAvatar ensName={ensName} />
              </div>
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
            {isConnected ? (
              <div className={styles.desktop_connect_button_inner}>
                <div className={styles.testing}>
                  <ENSAvatar ensName={ensName} />
                </div>

                <HumanAddress address={address} />
              </div>
            ) : (
              "Connect Wallet"
            )}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
