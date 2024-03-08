"use client";

import { formatNumber } from "@/lib/tokenUtils";
import Tenant from "@/lib/tenant";
import discord from "@/icons/discord.svg";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function DAOMetricsHeader({ metrics }) {
  const { token } = Tenant.getInstance();
  const [isClient, setIsClient] = useState(false);

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
                "flex items-center w-full sm:w-[1268px] h-10 bg-gray-fa shadow-newDefault",
                "border-t border-r border-l border-gray-eo rounded-tl-2xl rounded-tr-2xl",
                "text-xs text-gray-4f font-inter font-semibold"
              )}
            >
              <div className="w-2/5 sm:w-2/3 flex px-3 sm:px-8 gap-8 justify-center sm:justify-start">
                <span className="hidden sm:inline">
                  {formattedMetrics.totalSupply} {token.symbol} total supply
                </span>
                <span>
                  {formattedMetrics.votableSupply} {token.symbol} votable supply
                </span>
              </div>
              <div className="bg-gray-eo h-full w-[1px]"></div>
              <div className="w-3/5 sm:w-1/3 flex justify-center items-center px-3 sm:px-8 gap-4">
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
                  href="https://discord.gg/GsNyzbcZ"
                  rel="noreferrer nonopener"
                  target="_blank"
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
