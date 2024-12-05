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
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Menu, ExternalLink } from "lucide-react";

function ExternalLinkItem({ link }) {
  if (!link) {
    return null;
  }

  return (
    <a
      href={link.url}
      rel="noreferrer nonopener"
      target="_blank"
      className="flex items-center justify-between"
    >
      <span className="text-secondary/80 text-sm">{link.title}</span>
      <ExternalLink className="h-4 w-4 text-secondary/50" />
    </a>
  );
}

export default function DAOMetricsHeader({ metrics }) {
  const { token, ui, contracts } = Tenant.current();
  const [isClient, setIsClient] = useState(false);

  const governanceForumLink = ui.link("governance-forum");
  const bugsLink = ui.link("bugs");
  const changeLogLink = ui.link("changelog");
  const faqLink = ui.link("faq");
  const discordLink = ui.link("discord");
  const agoraLink = ui.link("agora");

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
          <div className="sm:min-w-desktop sticky z-50 bottom-0 sm:bottom-0 left-0 flex justify-center">
            <div
              className={cn(
                "flex flex-col sm:flex-row w-full sm:w-[1268px] bg-wash shadow-newDefault",
                "border-t border-r border-l border-line rounded-tl-2xl rounded-tr-2xl",
                "text-xs text-secondary font-inter font-medium",
                `transition-all duration-200 ease-in-out transform sm:transition-none sm:translate-y-0`
              )}
            >
              <div className="w-full flex items-center px-6 sm:px-8 gap-8 justify-between h-10">
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

                <Drawer>
                  <DrawerTrigger>
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-secondary/50" />
                  </DrawerTrigger>
                  <DrawerContent>
                    <div className="space-y-4 px-2 py-5 sm:py-8 max-w-[400px] w-full mx-auto">
                      <ExternalLinkItem link={governanceForumLink} />
                      <ExternalLinkItem link={bugsLink} />
                      {changeLogLink && (
                        <Link
                          href={changeLogLink.url}
                          className="flex items-center justify-between"
                        >
                          <span className="text-secondary/80 text-sm">
                            {changeLogLink.title}
                          </span>
                          <ExternalLink className="h-4 w-4 text-secondary/50" />
                        </Link>
                      )}
                      <ExternalLinkItem link={faqLink} />
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
                      <ExternalLinkItem link={agoraLink} />
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }
}
