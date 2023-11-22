// Header component
import Navbar from "./Navbar";
import { HStack } from "../Layout/Stack";
import Image from "next/image";
import LogoLink from "./LogoLink";

export default function Header() {
  return (
    <HStack className="main_header" justifyContent="justify-between">
      <LogoLink instance_name="Optimism" />
      <Navbar />
      <ConnectWalletButton />
    </HStack>
  );
}

function ConnectWalletButton() {
  return <w3m-button balance={false} />;
}
