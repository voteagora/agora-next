"use client";

import discord from "@/icons/discord.svg";
import Tenant from "@/lib/tenant/tenant";
import { formatNumber } from "@/lib/tokenUtils";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export default function DAOMetricsHeader({ metrics }) {
  const { token, ui, contracts } = Tenant.current();
  const [isClient, setIsClient] = useState(false);

  const governanceForumLink = ui.link("governance-forum");
  const bugsLink = ui.link("bugs");
  const changeLogLink = ui.link("changelog");
  const faqLink = ui.link("faq");
  const discordLink = ui.link("discord");
  const agoraLink = ui.link("agora");

  // discord + agora are hidden on mobile
  const hasLinksMobile =
    !!governanceForumLink || !!bugsLink || !!changeLogLink || !!faqLink;
  const hasLinksDesktop = hasLinksMobile || !!discordLink || !!agoraLink;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formattedMetrics = {
    votableSupply: formatNumber(metrics.votableSupply),
    totalSupply: formatNumber(metrics.totalSupply),
  };

  if (!isClient) {
    return null;
  } else {
    return (
      <>
        {createPortal(
          <div className="sm:min-w-desktop fixed z-50 bottom-0 left-0 flex justify-center w-full shadow-newDefault">
            <div
              className={cn(
                "flex flex-col sm:flex-row w-full sm:w-[1268px] bg-wash shadow-newDefault",
                "border-t border-r border-l border-line rounded-tl-2xl rounded-tr-2xl",
                "text-xs text-secondary font-inter font-medium",
                `transition-all duration-200 ease-in-out transform sm:transition-none sm:translate-y-0`
              )}
            >
              <div className="w-full sm:w-3/5 flex items-center px-6 sm:px-8 gap-8 justify-between sm:justify-start h-10">
                <div className="flex gap-6 sm:gap-8">
                  <HoverCard openDelay={100} closeDelay={100}>
                    <HoverCardTrigger>
                      <span className="cursor-default">
                        {formattedMetrics.totalSupply} {token.symbol} total
                        <span className="hidden sm:inline">&nbsp;supply</span>
                      </span>
                    </HoverCardTrigger>
                    <HoverCardContent
                      className="w-full shadow"
                      side="bottom"
                      sideOffset={3}
                    >
                      <span>Total amount of {token.symbol} in existence</span>
                    </HoverCardContent>
                  </HoverCard>
                  {contracts.token.isERC20() && (
                    <HoverCard openDelay={100} closeDelay={100}>
                      <HoverCardTrigger>
                        <span className="cursor-default">
                          {formattedMetrics.votableSupply} {token.symbol}{" "}
                          votable
                          <span className="hidden sm:inline">&nbsp;supply</span>
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent
                        className="w-full shadow"
                        side="bottom"
                        sideOffset={3}
                      >
                        <span>
                          {token.symbol} currently delegated to a voter
                        </span>
                      </HoverCardContent>
                    </HoverCard>
                  )}
                </div>
              </div>
              <div className="block bg-line w-full sm:w-[1px] h-[1px] sm:h-10"></div>
              <div
                className={`w-full sm:w-2/5 justify-end items-center px-6 sm:px-8 gap-4 h-10 ${
                  hasLinksMobile
                    ? "flex"
                    : hasLinksDesktop
                      ? "hidden sm:flex"
                      : "hidden"
                }`}
              >
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
                    rel="noreferrer nonopener"
                    target="_blank"
                    className="text-center"
                  >
                    {bugsLink.title}
                  </a>
                )}
                {changeLogLink && (
                  <Link href={changeLogLink.url} className="text-center">
                    {changeLogLink.title}
                  </Link>
                )}
                {faqLink && (
                  <a
                    href={faqLink.url}
                    rel="noreferrer nonopener"
                    target="_blank"
                    className="text-center"
                  >
                    {faqLink.title}
                  </a>
                )}

                {discordLink && (
                  <a
                    href={discordLink.url}
                    rel="noreferrer nonopener"
                    target="_blank"
                    className="hidden sm:inline"
                  >
                    <Image src={discord} alt={discordLink.title} />
                  </a>
                )}

                {agoraLink && (
                  <a
                    href={agoraLink.url}
                    rel="noreferrer nonopener"
                    target="_blank"
                    className="hidden sm:inline"
                  >
                    {agoraLink.title}
                  </a>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }
}
