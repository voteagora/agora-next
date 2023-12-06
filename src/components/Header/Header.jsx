"use client";

// Header component
import Navbar from "./Navbar";
import { HStack } from "../Layout/Stack";
import LogoLink from "./LogoLink";
import { ConnectButton } from "../ConnectButton/ConnectButton";

export default function Header() {
  return (
    <HStack className="main_header" justifyContent="justify-between">
      <LogoLink instance_name="Optimism" />
      <Navbar />

      <HStack gap="3" className="h-6 items-center">
        <ConnectButton />
      </HStack>
    </HStack>
  );
}
