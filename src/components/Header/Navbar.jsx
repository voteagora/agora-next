"use client";

import Tenant from "@/lib/tenant/tenant";
import { usePathname } from "next/navigation";
import { HeaderLink } from "./HeaderLink";
import { useAccount } from "wagmi";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { useRef, useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { ui } = Tenant.current();
  const [activeIndicator, setActiveIndicator] = useState({ left: 0, width: 0 });
  const navRef = useRef(null);
  const linkRefs = useRef({});

  const hasProposals = ui.toggle("proposals") && ui.toggle("proposals").enabled;
  const hasProposalsHref = Boolean(ui.page("proposals")?.href);

  const { address } = useAccount();
  const { isConnected } = useAgoraContext();

  // Update the active indicator position when the pathname changes
  useEffect(() => {
    // Find the active link based on pathname
    const activeKey = Object.keys(linkRefs.current).find(key => {
      if (key === 'proposals' && (pathname.includes('proposals') || pathname === '/')) return true;
      if (key === 'delegates' && pathname.includes('delegates')) return true;
      if (key === 'staking' && pathname.includes('staking')) return true;
      if (key === 'retropgf' && pathname.includes('retropgf/3/summary')) return true;
      if (key === 'info' && pathname.includes('info')) return true;
      return false;
    });

    if (activeKey && linkRefs.current[activeKey]) {
      const linkElement = linkRefs.current[activeKey];
      const rect = linkElement.getBoundingClientRect();
      const navRect = navRef.current.getBoundingClientRect();

      setActiveIndicator({
        left: rect.left - navRect.left,
        width: rect.width
      });
    }
  }, [pathname]);

  return (
    <div
      ref={navRef}
      className={`flex flex-row bg-neutral rounded-full border border-line p-1 font-medium relative`}
    >
      {/* Sliding overlay */}
      <div 
        className="absolute bg-white rounded-full border border-line shadow-newDefault transition-all duration-300 ease-in-out h-[38px]"
        style={{
          left: `${activeIndicator.left}px`,
          width: `${activeIndicator.width}px`,
          opacity: activeIndicator.width ? 1 : 0
        }}
      />

      {hasProposals && (
        <HeaderLink
          ref={el => linkRefs.current.proposals = el}
          href={hasProposalsHref ? ui.page("proposals")?.href : "/proposals"}
          target={hasProposalsHref ? "_blank" : "_self"}
          isActive={pathname.includes("proposals") || pathname === "/"}
        >
          Proposals
        </HeaderLink>
      )}

      {ui.toggle("delegates") && ui.toggle("delegates").enabled && (
        <HeaderLink 
          ref={el => linkRefs.current.delegates = el}
          href="/delegates" 
          isActive={pathname.includes("delegates")}
        >
          Voters
        </HeaderLink>
      )}

      {ui.toggle("staking") && ui.toggle("staking").enabled && (
        <HeaderLink
          ref={el => linkRefs.current.staking = el}
          href={isConnected && address ? `/staking/${address}` : "/staking"}
          isActive={pathname.includes("staking")}
        >
          Staking
        </HeaderLink>
      )}

      {ui.toggle("retropgf") && ui.toggle("retropgf").enabled && (
        <HeaderLink
          ref={el => linkRefs.current.retropgf = el}
          href="/retropgf/3/summary"
          isActive={pathname.includes("retropgf/3/summary")}
        >
          RetroPGF
        </HeaderLink>
      )}

      {ui.toggle("info") && ui.toggle("info").enabled && (
        <HeaderLink 
          ref={el => linkRefs.current.info = el}
          href="/info" 
          isActive={pathname.includes("info")}
        >
          Info
        </HeaderLink>
      )}
    </div>
  );
}
