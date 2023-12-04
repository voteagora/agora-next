// Header component
import Navbar from "./Navbar";
import { HStack } from "../Layout/Stack";
import LogoLink from "./LogoLink";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import styles from "./header.module.scss";

export default function Header() {
  return (
    <HStack className="main_header" justifyContent="justify-between">
      <LogoLink instance_name="Optimism" />
      <Navbar />
      <ConnectButton />
    </HStack>
  );
}

function ConnectButton() {
  const { open } = useWeb3Modal();

  return <w3m-button />;
  // return (
  //     <button className={styles.connect_button} onClick={() => open()}>Connect Wallet</button>
  // )
}
