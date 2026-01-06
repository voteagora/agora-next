import React from "react";
import { Drawer } from "../ui/Drawer";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";
import { useAccount } from "wagmi";
import { useAgoraContext } from "@/contexts/AgoraContext";
import Image from "next/image";
import agoraLogo from "@/icons/agoraIconWithText.svg";
import discordIcon from "@/icons/discord.svg";
import XIcon from "@/icons/x.svg";
import FarcasterIcon from "@/icons/farcaster.svg";
import { useDAOMetrics } from "@/hooks/useDAOMetrics";
import { formatNumber } from "@/lib/tokenUtils";

interface MobileNavMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavMenu({ isOpen, onClose }: MobileNavMenuProps) {
  const pathname = usePathname() || "";
  const { ui, token, contracts } = Tenant.current();
  const { address } = useAccount();
  const { isConnected } = useAgoraContext();
  const { votableSupply, totalSupply, isLoading } = useDAOMetrics();

  // Links
  const governanceForumLink = ui.link("governance-forum");
  const bugsLink = ui.link("bugs");
  const changeLogLink = ui.link("changelog");
  const faqLink = ui.link("faq");
  const discordLink = ui.link("discord");
  const twitterLink = ui.link("townstwitter");
  const farcasterLink = ui.link("townsfarcaster");
  const agoraLink = ui.link("agora");

  const proposalsToggle = ui.toggle("proposals");
  const hasProposals = proposalsToggle !== undefined && proposalsToggle.enabled;
  const hasProposalsHref = ui.page("proposals")?.href !== undefined;

  const delegatesToggle = ui.toggle("delegates");
  const hasDelegates = delegatesToggle !== undefined && delegatesToggle.enabled;

  const stakingToggle = ui.toggle("staking");
  const hasStaking = stakingToggle !== undefined && stakingToggle.enabled;

  const retropgfToggle = ui.toggle("retropgf");
  const hasRetropgf = retropgfToggle !== undefined && retropgfToggle.enabled;

  const infoToggle = ui.toggle("info");
  const hasInfo = infoToggle !== undefined && infoToggle.enabled;

  const comingSoonToggle = ui.toggle("coming-soon");
  const hasComingSoon =
    comingSoonToggle !== undefined && comingSoonToggle.enabled;
  const forumsToggle = ui.toggle("forums");
  const hasForums = forumsToggle !== undefined && forumsToggle.enabled;

  const grantsToggle = ui.toggle("grants");
  const hasGrants = grantsToggle !== undefined && grantsToggle.enabled;

  // Format metrics
  const formattedMetrics = {
    votableSupply: formatNumber(votableSupply),
    totalSupply: formatNumber(totalSupply),
  };

  const navItems = [
    ...(hasProposals
      ? [
          {
            name: "Proposals",
            href: hasProposalsHref
              ? ui.page("proposals")?.href || "/proposals"
              : "/proposals",
            target: hasProposalsHref ? "_blank" : "_self",
            isActive: pathname.includes("proposals") || pathname === "/",
          },
        ]
      : []),
    ...(hasDelegates
      ? [
          {
            name: "Voters",
            href: "/delegates",
            target: "_self",
            isActive: pathname.includes("delegates"),
          },
        ]
      : []),
    ...(hasStaking
      ? [
          {
            name: "Staking",
            href: isConnected && address ? `/staking/${address}` : "/staking",
            target: "_self",
            isActive: pathname.includes("staking"),
          },
        ]
      : []),
    ...(hasRetropgf
      ? [
          {
            name: "RetroPGF",
            href: "/retropgf/3/summary",
            target: "_self",
            isActive: pathname.includes("retropgf/3/summary"),
          },
        ]
      : []),
    ...(hasGrants
      ? [
          {
            name: "Grants",
            href: "/grants",
            target: "_self",
            isActive: pathname.includes("grants"),
          },
        ]
      : []),
    ...(hasInfo
      ? [
          {
            name: "Info",
            href: "/info",
            target: "_self",
            isActive: pathname.includes("info"),
          },
        ]
      : []),
    ...(hasComingSoon
      ? [
          {
            name: "Governance",
            href: "/coming-soon",
            target: "_self",
            isActive: pathname.includes("coming-soon"),
          },
        ]
      : []),
    ...(hasForums
      ? [
          {
            name: "Discussions",
            href: "/forums",
            target: "_self",
            isActive: pathname.includes("forums"),
          },
        ]
      : []),
  ];

  return (
    <Drawer isOpen={isOpen} onClose={onClose} side="left" title="Menu">
      <div className="flex flex-col h-full">
        <div className="pl-4 pr-6 py-8 flex flex-col justify-start items-start text-primary">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              target={item.target}
              onClick={() => setTimeout(onClose, 100)}
              className={cn(
                "self-stretch pl-4 pr-2 py-2 h-12 flex items-center",
                item.isActive ? "bg-tertiary/10" : ""
              )}
            >
              <div className="font-semibold">{item.name}</div>
            </Link>
          ))}
        </div>

        {/* Bottom Sections */}
        <div className="mt-auto text-tertiary text-base font-semibold leading-normal">
          {(totalSupply > 0 || votableSupply > 0) &&
            !ui.toggle("footer/hide-total-supply")?.enabled && (
              <div className="p-8 flex flex-col justify-center border-b border-t border-line items-start gap-3">
                <div className="">
                  {isLoading ? "-" : formattedMetrics.totalSupply}{" "}
                  {token.symbol} total supply
                </div>
                {(contracts.token.isERC20() || contracts.token.isERC721()) && (
                  <div className="">
                    {isLoading ? "-" : formattedMetrics.votableSupply}{" "}
                    {token.symbol} votable supply
                  </div>
                )}
              </div>
            )}

          {/* Links Section */}
          {(changeLogLink ||
            bugsLink ||
            discordLink ||
            twitterLink ||
            farcasterLink) && (
            <div className="p-8 border-b border-line flex flex-col justify-center items-start gap-2.5">
              <div className="flex flex-col justify-center items-start gap-6 font-medium">
                {governanceForumLink && (
                  <a
                    href={governanceForumLink.url}
                    rel="noreferrer nonopener"
                    target="_blank"
                    className="text-center"
                  >
                    {governanceForumLink.title}
                  </a>
                )}
                {bugsLink && (
                  <a
                    href={bugsLink.url}
                    target="_blank"
                    rel="noreferrer"
                    className="justify-start"
                  >
                    {bugsLink.title}
                  </a>
                )}
                {changeLogLink && (
                  <Link href={changeLogLink.url} className="justify-start">
                    {changeLogLink.title}
                  </Link>
                )}
                {faqLink && (
                  <a
                    href={faqLink.url}
                    rel="noreferrer nonopener"
                    target="_blank"
                    className="justify-start"
                  >
                    {faqLink.title}
                  </a>
                )}
                {agoraLink && (
                  <a
                    href={agoraLink.url}
                    rel="noreferrer nonopener"
                    target="_blank"
                    className="justify-start"
                  >
                    {agoraLink.title}
                  </a>
                )}
                {discordLink && (
                  <a
                    href={discordLink.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-6 h-6"
                  >
                    <Image
                      src={discordIcon.src}
                      alt="Discord"
                      width={24}
                      height={24}
                    />
                  </a>
                )}
                {twitterLink && (
                  <a
                    href={twitterLink.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-6 h-6"
                  >
                    <Image src={XIcon} alt="Twitter" width={24} height={24} />
                  </a>
                )}
                {farcasterLink && (
                  <a
                    href={farcasterLink.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-6 h-6"
                  >
                    <Image
                      src={FarcasterIcon}
                      alt="Farcaster"
                      width={24}
                      height={24}
                    />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Agora Logo Section */}
          <div className="p-8 bg-neutral-50 flex justify-start items-center gap-2">
            <Image
              src={agoraLogo.src}
              alt="Agora Logo"
              width={82}
              height={21}
            />
            <div className="justify-start text-primary font-normal text-sm">
              Onchain Governance
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export default MobileNavMenu;
