"use client";

import Tenant from "@/lib/tenant/tenant";
import { usePathname } from "next/navigation";
import { HStack } from "../Layout/Stack";
import { HeaderLink } from "./HeaderLink";
import styles from "./header.module.scss";

export default function Navbar() {
  const pathname = usePathname();
  const tenant = Tenant.current();

  return (
    <HStack className={styles.main_nav}>
      {tenant.ui.toggle("proposals") &&
        tenant.ui.toggle("proposals").enabled && (
          <HeaderLink
            href="/"
            isActive={pathname.includes("proposals") || pathname === "/"}
          >
            Proposals
          </HeaderLink>
        )}

      {tenant.ui.toggle("delegates") &&
        tenant.ui.toggle("delegates").enabled && (
          <HeaderLink
            href="/delegates"
            isActive={pathname.includes("delegates")}
          >
            Voters
          </HeaderLink>
        )}

      {tenant.ui.toggle("retropgf") && tenant.ui.toggle("retropgf").enabled && (
        <HeaderLink
          href="/retropgf/3/summary"
          isActive={pathname.includes("retropgf/3/summary")}
        >
          RetroPGF
        </HeaderLink>
      )}
    </HStack>
  );
}
