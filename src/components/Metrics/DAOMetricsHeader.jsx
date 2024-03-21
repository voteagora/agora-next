"use client";

import discord from "@/icons/discord.svg";
import infoTransparent from "@/icons/info-transparent.svg";
import Tenant from "@/lib/tenant/tenant";
import { formatNumber } from "@/lib/tokenUtils";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function DAOMetricsHeader({ metrics }) {
  const { token, ui } = Tenant.current();
  const [isClient, setIsClient] = useState(false);
  const [visible, setVisible] = useState(false);

  const bugsLink = ui.link("bugs");
  const changeLogLink = ui.link("changelog");
  const faqLink = ui.link("faq");
  const discordLink = ui.link("discord");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formattedMetrics = {
    votableSupply: formatNumber(metrics.votableSupply),
    totalSupply: formatNumber(metrics.totalSupply),
  };

  if (isClient) {
    return (
      <>
        {createPortal(
          <div className="sm:min-w-desktop sticky z-50 bottom-0 left-0 flex justify-center">
            <div
              className={cn(
                "flex flex-col sm:flex-row w-full sm:w-[1268px] bg-gray-fa shadow-newDefault",
                "border-t border-r border-l border-gray-eo rounded-tl-2xl rounded-tr-2xl",
                "text-xs text-gray-4f font-inter font-medium",
                `transition-all duration-200 ease-in-out transform ${
                  visible ? "translate-y-0" : "translate-y-10"
                } sm:transition-none sm:translate-y-0`,
              )}
            >
              <div
                className="w-full sm:w-2/3 flex items-center px-6 sm:px-8 gap-8 justify-between sm:justify-start h-10"
                onClick={() => setVisible(!visible)}
              >
                <div className="flex gap-6 sm:gap-8">
                  <span>
                    {formattedMetrics.totalSupply} {token.symbol} total
                    <span className="hidden sm:inline">&nbsp;supply</span>
                  </span>
                  <span>
                    {formattedMetrics.votableSupply} {token.symbol} votable
                    <span className="hidden sm:inline">&nbsp;supply</span>
                  </span>
                </div>
                <Image
                  src={infoTransparent}
                  alt="Info"
                  className="inline sm:hidden"
                />
              </div>
              <div className="block bg-gray-eo w-full sm:w-[1px] h-[1px] sm:h-10"></div>
              <div
                className="w-full sm:w-1/3 flex justify-start sm:justify-center items-center px-6 sm:px-8 gap-4 h-10">
                {bugsLink &&
                  <a
                    href={bugsLink.url}
                    rel="noreferrer nonopener"
                    target="_blank"
                  >
                    {bugsLink.title}
                  </a>
                }
                {changeLogLink && <Link href={changeLogLink.url}>{changeLogLink.title}</Link>}
                {faqLink &&
                  <a
                    href={faqLink.url}
                    rel="noreferrer nonopener"
                    target="_blank"
                  >
                    {faqLink.title}
                  </a>
                }

                {discordLink &&
                  <a
                    href={discordLink.url}
                    rel="noreferrer nonopener"
                    target="_blank"
                    className="hidden sm:inline"
                  >
                    <Image src={discord} alt={discordLink.title} />
                  </a>
                }
              </div>
            </div>
          </div>,
          document.body,
        )}
      </>
    );
  }
}
