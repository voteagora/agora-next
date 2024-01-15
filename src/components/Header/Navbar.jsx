"use client";

import { usePathname } from "next/navigation";
import { HStack } from "../Layout/Stack";
import { HeaderLink } from "./HeaderLink";
import styles from "./header.module.scss";

export default function Navbar() {
  const pathname = usePathname();
  return (
    <HStack className={styles.main_nav}>
      <HeaderLink
        href="/"
        isActive={pathname.includes("proposals") || pathname === "/"}
      >
        Proposals
      </HeaderLink>

      <HeaderLink href="/delegates" isActive={pathname.includes("delegates")}>
        Voters
      </HeaderLink>
      <HeaderLink
        href="/retropgf/3/summary"
        isActive={pathname.includes("retropgf/3/summary")}
      >
        RetroPGF
      </HeaderLink>
    </HStack>
  );
}
