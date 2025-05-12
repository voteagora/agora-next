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
import { useDAOMetrics } from "@/hooks/useDAOMetrics";
import { AgoraIconWithText } from "@/icons/AgoraIconWithText";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types.d";
import { useAccount } from "wagmi";
import { TENANT_NAMESPACES } from "@/lib/constants";

export default function DAOMetricsHeader() {
  const { token, ui, contracts, namespace } = Tenant.current();
  const [isClient, setIsClient] = useState(false);
  const { votableSupply, totalSupply, isLoading } = useDAOMetrics();
  const { address } = useAccount();
  const governanceForumLink = ui.link("governance-forum");
  const bugsLink = ui.link("bugs");
  const changeLogLink = ui.link("changelog");
  const faqLink = ui.link("faq");
  const discordLink = ui.link("discord");
  const agoraLink = ui.link("agora");

  // Check if there are any links to display
  const hasLinks =
    !!governanceForumLink ||
    !!bugsLink ||
    !!changeLogLink ||
    !!faqLink ||
    !!discordLink ||
    !!agoraLink;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (address && namespace === TENANT_NAMESPACES.OPTIMISM) {
      trackEvent({
        event_name: ANALYTICS_EVENT_NAMES.WALLET_CONNECTED,
        event_data: {
          address,
        },
      });
    }
  }, [address, namespace]);

  const formattedMetrics = {
    votableSupply: formatNumber(votableSupply),
    totalSupply: formatNumber(totalSupply),
  };

  if (!isClient) {
    return null;
  }

  return (
    <>
      {createPortal(
        <div className="sticky z-50 bottom-0 hidden sm:flex left-0 justify-center border-t border-line">
          <div
            className={cn(
              "flex flex-row w-full bg-wash border-wash justify-between",
              "text-xs text-secondary font-inter font-medium"
            )}
          >
            <div className="flex items-center px-8 gap-8 justify-start h-14">
              <div className="flex gap-8">
                <div className="flex items-center gap-2">
                  <AgoraIconWithText className="fill-primary h-[21px] w-[82px]" />
                  <span className="text-sm text-primary font-medium hidden lg:inline">
                    Onchain Governance
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              {hasLinks && (
                <div className="flex justify-end items-center text-tertiary px-6 gap-6 h-14 border-l border-line">
                  {discordLink && (
                    <a
                      href={discordLink.url}
                      rel="noreferrer nonopener"
                      target="_blank"
                    >
                      <Image src={discord} alt={discordLink.title} />
                    </a>
                  )}
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
                    <Link
                      href={changeLogLink.url}
                      className="text-center hidden lg:inline"
                    >
                      {changeLogLink.title}
                    </Link>
                  )}
                  {faqLink && (
                    <a
                      href={faqLink.url}
                      rel="noreferrer nonopener"
                      target="_blank"
                      className="text-center hidden lg:inline"
                    >
                      {faqLink.title}
                    </a>
                  )}
                  {agoraLink && (
                    <a
                      href={agoraLink.url}
                      rel="noreferrer nonopener"
                      target="_blank"
                    >
                      {agoraLink.title}
                    </a>
                  )}
                </div>
              )}
              <div className="flex px-6 gap-6 h-14 border-l border-line text-tertiary">
                <HoverCard openDelay={100} closeDelay={100}>
                  <HoverCardTrigger className="flex">
                    <span className="cursor-default content-center">
                      {isLoading ? "-" : formattedMetrics.totalSupply}{" "}
                      {token.symbol} total supply
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
                    <HoverCardTrigger className="flex">
                      <span className="cursor-default content-center">
                        {isLoading ? "-" : formattedMetrics.votableSupply}{" "}
                        {token.symbol} votable supply
                      </span>
                    </HoverCardTrigger>
                    <HoverCardContent
                      className="w-full shadow"
                      side="bottom"
                      sideOffset={3}
                    >
                      <span>{token.symbol} currently delegated to a voter</span>
                    </HoverCardContent>
                  </HoverCard>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
