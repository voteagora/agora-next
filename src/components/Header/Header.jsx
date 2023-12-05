"use client";

// Header component
import Navbar from "./Navbar";
import { HStack } from "../Layout/Stack";
import LogoLink from "./LogoLink";
import { useAccount } from "wagmi";
import { MobileConnectButton } from "../ConnectButton/MobileConnectButton";
import { DesktopConnectButton } from "../ConnectButton/DesktopConnectButton";

export default function Header() {
  const { address } = useAccount();

  return (
    <HStack className="main_header" justifyContent="justify-between">
      <LogoLink instance_name="Optimism" />
      <Navbar />

      <HStack alignItems="center" gap="3" className="h-6">
        <HStack justifyContent="center" className="hidden md:block">
          <DesktopConnectButton />
        </HStack>
        <HStack justifyContent="center" className="block md:hidden">
          <MobileConnectButton />
        </HStack>
      </HStack>
    </HStack>
  );
}
