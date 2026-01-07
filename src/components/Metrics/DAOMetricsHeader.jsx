"use client";

import discord from "@/icons/discord.svg";
import XIcon from "@/icons/x.svg";
import FarcasterIcon from "@/icons/farcaster.svg";
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

export default function DAOMetricsHeader() {
  const { token, ui, contracts } = Tenant.current();
  const [isClient, setIsClient] = useState(false);
  const { votableSupply, totalSupply, isLoading } = useDAOMetrics();
  const { address } = useAccount();
  const governanceForumLink = ui.link("governance-forum");
  const bugsLink = ui.link("bugs");
  const changeLogLink = ui.link("changelog");
  const faqLink = ui.link("faq");
  const discordLink = ui.link("discord");
  const twitterLink = ui.link("townstwitter");
  const farcasterLink = ui.link("townsfarcaster");
  const agoraLink = ui.link("agora");

  const links = [
    governanceForumLink,
    bugsLink,
    changeLogLink,
    faqLink,
    discordLink,
    twitterLink,
    farcasterLink,
    agoraLink,
  ].filter(Boolean);
  const needToHideLinksOnSmallScreens = links.length >= 4;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (address) {
      trackEvent({
        event_name: ANALYTICS_EVENT_NAMES.WALLET_CONNECTED,
        event_data: {
          address,
        },
      });
    }
  }, [address]);

  const formattedMetrics = {
    votableSupply: formatNumber(votableSupply),
    totalSupply: formatNumber(totalSupply),
  };
  const hideVotableSupply = ui.toggle("footer/hide-votable-supply")?.enabled;

  if (!isClient) {
    return null;
  }

  return (
    <>
      {createPortal(
        <div className="sticky bg-footerBackground z-50 bottom-0 hidden sm:flex left-0 rounded-t-xl justify-center border-t border-x border-line mx-auto max-w-[1280px] px-3 sm:px-8 h-12 shadow-newDefault">
          <div
            className={cn(
              "flex flex-row w-full bg-innerFooterBackground border-wash justify-between",
              "text-xs text-secondary font-inter font-medium"
            )}
          >
            <div className="flex items-center justify-start">
              <div className="flex gap-8">
                <div className="flex items-center gap-2">
                  <a
                    href="https://agora.xyz"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <AgoraIconWithText
                      className="fill-secondary h-5 transition-colors duration-200 hover:fill-primary"
                      style={{
                        filter: ui.customization?.footerBackground
                          ? "brightness(0) invert(1)"
                          : "none",
                      }}
                    />
                  </a>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              {links.length > 0 && (
                <div className="flex justify-end items-center text-tertiary px-6 gap-6 border-l border-line">
                  {discordLink && (
                    <a
                      href={discordLink.url}
                      rel="noreferrer nonopener"
                      target="_blank"
                      className="min-w-[24px]"
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
                      className={`text-center ${needToHideLinksOnSmallScreens ? "hidden lg:inline" : ""}`}
                    >
                      {changeLogLink.title}
                    </Link>
                  )}
                  {faqLink && (
                    <a
                      href={faqLink.url}
                      rel="noreferrer nonopener"
                      target="_blank"
                      className={`text-center ${needToHideLinksOnSmallScreens ? "hidden lg:inline" : ""}`}
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
                  {twitterLink && (
                    <a
                      href={twitterLink.url}
                      rel="noreferrer nonopener"
                      target="_blank"
                      className="flex items-center"
                    >
                      <Image
                        src={XIcon}
                        alt="Twitter"
                        width={16}
                        height={16}
                        className="w-4 h-4"
                        style={{ filter: "brightness(0) invert(1)" }}
                      />
                    </a>
                  )}
                  {farcasterLink && (
                    <a
                      href={farcasterLink.url}
                      rel="noreferrer nonopener"
                      target="_blank"
                      className="flex items-center"
                    >
                      <Image
                        src={FarcasterIcon}
                        alt="Farcaster"
                        width={16}
                        height={16}
                        className="w-4 h-4"
                        style={{ filter: "brightness(0) invert(1)" }}
                      />
                    </a>
                  )}
                </div>
              )}
              {!ui.toggle("footer/hide-total-supply")?.enabled && (
                <div className="flex px-6 gap-6 border-l border-line text-tertiary">
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
                  {!hideVotableSupply &&
                    contracts.token.isERC20() | contracts.token.isERC721() && (
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
                          <span>
                            {token.symbol} currently delegated to a voter
                          </span>
                        </HoverCardContent>
                      </HoverCard>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
