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
  const [activeNavItem, setActiveNavItem] = useState(null);
  const navRef = useRef(null);
  const linkRefs = useRef({});

  const hasProposals = ui.toggle("proposals") && ui.toggle("proposals").enabled;
  const hasProposalsHref = Boolean(ui.page("proposals")?.href);
  const hasComingSoon =
    ui.toggle("coming-soon") && ui.toggle("coming-soon").enabled;

  const { address } = useAccount();
  const { isConnected } = useAgoraContext();

  // Handle nav link click
  const handleNavClick = (key) => {
    setActiveNavItem(key);
  };

  // Initialize the active nav item based on pathname when component loads
  useEffect(() => {
    // Extract the first part of the pathname to determine the active section
    const path = pathname === "/" ? "proposals" : pathname.split("/")[1];

    console.log("path", path);
    console.log("linkRefs.current", linkRefs.current);

    // Check if the path matches any of our nav items directly
    // This avoids explicit pathname checks and makes adding new nav items easier
    if (path && linkRefs.current[path]) {
      setActiveNavItem(path);
    } else if (pathname === "/" && linkRefs.current["proposals"]) {
      // Special case for homepage
      setActiveNavItem("proposals");
    } else if (path === "retropgf" && linkRefs.current["retropgf"]) {
      // Special case for retropgf which has a more complex path
      setActiveNavItem("retropgf");
    } else if (
      pathname.includes("coming-soon") &&
      linkRefs.current["coming-soon"]
    ) {
      // Special case for coming-soon
      setActiveNavItem("coming-soon");
    } else if (path === "forums" && linkRefs.current["forums"]) {
      setActiveNavItem("forums");
    } else if (path === "document-archive" && linkRefs.current["info"]) {
      setActiveNavItem("info");
    }
  }, [pathname]);

  // Update the active indicator position when activeNavItem changes
  useEffect(() => {
    if (activeNavItem && linkRefs.current[activeNavItem]) {
      const linkElement = linkRefs.current[activeNavItem];
      const rect = linkElement.getBoundingClientRect();
      const navRect = navRef.current.getBoundingClientRect();

      setActiveIndicator({
        left: rect.left - navRect.left,
        width: rect.width,
      });
    }
  }, [activeNavItem]);

  return (
    <div
      ref={navRef}
      className={`relative flex flex-row rounded-full border border-line p-1 font-medium bg-infoTabBackground`}
    >
      {/* Sliding overlay */}
      {activeNavItem && (
        <div
          className="absolute rounded-full shadow-newDefault transition-all duration-150 ease-in-out h-[38px]"
          style={{
            left: `${activeIndicator.left}px`,
            width: `${activeIndicator.width}px`,
            opacity: activeIndicator.width ? 1 : 0,
            backgroundColor:
              ui.customization?.customButtonBackground || "rgb(255, 255, 255)",
          }}
        />
      )}

      {hasProposals && (
        <HeaderLink
          ref={(el) => {
            linkRefs.current.proposals = el;
          }}
          href={hasProposalsHref ? ui.page("proposals")?.href : "/proposals"}
          target={hasProposalsHref ? "_blank" : "_self"}
          isActive={activeNavItem === "proposals"}
          onClick={() => handleNavClick("proposals")}
        >
          Proposals
        </HeaderLink>
      )}

      {hasComingSoon && (
        <HeaderLink
          ref={(el) => {
            linkRefs.current["coming-soon"] = el;
          }}
          href="/coming-soon"
          isActive={activeNavItem === "coming-soon"}
          onClick={() => handleNavClick("coming-soon")}
        >
          Governance
        </HeaderLink>
      )}

      {ui.toggle("forums") && ui.toggle("forums").enabled && (
        <HeaderLink
          ref={(el) => {
            linkRefs.current.forums = el;
          }}
          href="/forums"
          isActive={activeNavItem === "forums"}
          onClick={() => handleNavClick("forums")}
        >
          Discussions
        </HeaderLink>
      )}
      {ui.toggle("delegates") && ui.toggle("delegates").enabled && (
        <HeaderLink
          ref={(el) => {
            linkRefs.current.delegates = el;
          }}
          href="/delegates"
          isActive={activeNavItem === "delegates"}
          onClick={() => handleNavClick("delegates")}
        >
          Voters
        </HeaderLink>
      )}

      {ui.toggle("staking") && ui.toggle("staking").enabled && (
        <HeaderLink
          ref={(el) => {
            linkRefs.current.staking = el;
          }}
          href={isConnected && address ? `/staking/${address}` : "/staking"}
          isActive={activeNavItem === "staking"}
          onClick={() => handleNavClick("staking")}
        >
          Staking
        </HeaderLink>
      )}

      {ui.toggle("retropgf") && ui.toggle("retropgf").enabled && (
        <HeaderLink
          ref={(el) => {
            linkRefs.current.retropgf = el;
          }}
          href="/retropgf/3/summary"
          isActive={activeNavItem === "retropgf"}
          onClick={() => handleNavClick("retropgf")}
        >
          RetroPGF
        </HeaderLink>
      )}

      {ui.toggle("info") && ui.toggle("info").enabled && (
        <HeaderLink
          ref={(el) => {
            linkRefs.current.info = el;
          }}
          href="/info"
          isActive={activeNavItem === "info"}
          onClick={() => handleNavClick("info")}
        >
          Info
        </HeaderLink>
      )}
    </div>
  );
}
