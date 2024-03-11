"use client";

import { formatNumber } from "@/lib/tokenUtils";
import Tenant from "@/lib/tenant/tenant";
import discord from "@/icons/discord.svg";
import infoTransparent from "@/icons/info-transparent.svg";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function DAOMetricsHeader({ metrics }) {
  const { token } = Tenant.getInstance();
  const [isClient, setIsClient] = useState(false);
  const [visible, setVisible] = useState(false);

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
                } sm:transition-none sm:translate-y-0`
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
              <div className="w-full sm:w-1/3 flex justify-start sm:justify-center items-center px-6 sm:px-8 gap-4 h-10">
                <a
                  href="https://app.deform.cc/form/7180b273-7662-4f96-9e66-1eae240a52bc/"
                  rel="noreferrer nonopener"
                  target="_blank"
                >
                  Report bugs & feedback
                </a>
                <Link href="/changelog">Change log</Link>
                <a
                  href="https://argoagora.notion.site/Optimism-Agora-FAQ-3922ac9c66e54a21b5de16be9e0cf79c"
                  rel="noreferrer nonopener"
                  target="_blank"
                >
                  FAQ
                </a>
                <a
                  href="https://discord.gg/vBJkUYBuwX"
                  rel="noreferrer nonopener"
                  target="_blank"
                  className="hidden sm:inline"
                >
                  <Image src={discord} alt="Discord" />
                </a>
              </div>
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }
}
