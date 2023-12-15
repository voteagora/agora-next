// Header component
import Navbar from "./Navbar";
import { HStack, VStack } from "../Layout/Stack";
import LogoLink from "./LogoLink";
import styles from "./header.module.scss";
import { ConnectKitButton } from "connectkit";

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
  return <ConnectKitButton />;
}
