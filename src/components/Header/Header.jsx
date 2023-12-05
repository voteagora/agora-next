"use client";

// Header component
import Navbar from "./Navbar";
import { HStack } from "../Layout/Stack";
import LogoLink from "./LogoLink";
import styles from "./header.module.scss";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";

export default function Header() {
  const { address } = useAccount();

  return (
    <HStack className="main_header" justifyContent="justify-between">
      <LogoLink instance_name="Optimism" />
      <Navbar />
      <ConnectKitButton />
    </HStack>
  );
}
