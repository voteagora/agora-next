"use client";

import Tenant from "@/lib/tenant/tenant";
import { usePathname } from "next/navigation";
import { HeaderLink } from "./HeaderLink";
import styles from "./header.module.scss";
import { useAccount } from "wagmi";
import { useAgoraContext } from "@/contexts/AgoraContext";

export default function Navbar() {
  const pathname = usePathname();
  const { ui } = Tenant.current();

  const hasProposals = ui.toggle("proposals") && ui.toggle("proposals").enabled;
  const hasProposalsHref = Boolean(ui.page("proposals")?.href);

  const { address } = useAccount();
  const { isConnected } = useAgoraContext();

  return (
    <div className={`flex flex-row ${styles.main_nav}`}>
      {hasProposals && (
        <HeaderLink
          href={hasProposalsHref ? ui.page("proposals")?.href : "/"}
          target={hasProposalsHref ? "_blank" : "_self"}
          isActive={pathname.includes("proposals") || pathname === "/"}
        >
          Proposals
        </HeaderLink>
      )}

      {ui.toggle("delegates") && ui.toggle("delegates").enabled && (
        <HeaderLink href="/delegates" isActive={pathname.includes("delegates")}>
          Voters
        </HeaderLink>
      )}

      {ui.toggle("staking") && ui.toggle("staking").enabled && (
        <HeaderLink
          href={isConnected && address ? `/staking/${address}` : "/staking"}
          isActive={pathname.includes("staking")}
        >
          Staking
        </HeaderLink>
      )}

      {ui.toggle("retropgf") && ui.toggle("retropgf").enabled && (
        <HeaderLink
          href="/retropgf/3/summary"
          isActive={pathname.includes("retropgf/3/summary")}
        >
          RetroPGF
        </HeaderLink>
      )}

      {ui.toggle("info") && ui.toggle("info").enabled && (
        <HeaderLink href="/info" isActive={pathname.includes("info")}>
          Info
        </HeaderLink>
      )}
    </div>
  );
}
