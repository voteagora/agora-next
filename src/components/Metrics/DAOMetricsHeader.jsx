"use server";

import { formatNumber } from "@/lib/tokenUtils";
import Tenant from "@/lib/tenant";
import discord from "@/icons/discord.svg";
import farcaster from "@/icons/farcaster.svg";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default async function DAOMetricsHeader({ metrics }) {
  const { token } = Tenant.getInstance();

  const formatUniqueVoters = (number) => {
    const numberFormat = new Intl.NumberFormat("en", {
      style: "currency",
      currency: "USD",
      currencyDisplay: "code",
      compactDisplay: "short",
      notation: "compact",
      maximumSignificantDigits: 4,
    });

    const parts = numberFormat.formatToParts(number);
    return parts
      .filter((part) => part.type !== "currency" && part.type !== "literal")
      .map((part) => part.value)
      .join("");
  };

  const formattedMetrics = {
    votableSupply: formatNumber(metrics.votableSupply),
    totalSupply: formatNumber(metrics.totalSupply),
    uniqueVotersCount: formatUniqueVoters(metrics.uniqueVotersCount),
  };

  return (
    <div className="w-screen sm:min-w-desktop fixed z-50 bottom-0 left-0 flex justify-center">
      <div
        className={cn(
          "flex items-center w-full sm:w-[1268px] h-10 bg-gray-fa shadow-newDefault",
          "border-t border-r border-l border-gray-eo rounded-tl-2xl rounded-tr-2xl",
          "text-xs text-gray-4f font-inter font-semibold"
        )}
      >
        <div className="w-1/2 sm:w-4/5 flex px-3 sm:px-8 gap-8 justify-center sm:justify-start">
          <span className="hidden sm:inline">
            {formattedMetrics.totalSupply} {token.symbol} total supply
          </span>
          <span>
            {formattedMetrics.votableSupply} {token.symbol} votable supply
          </span>
          <span className="hidden sm:inline">
            {formattedMetrics.uniqueVotersCount} active voters
          </span>
        </div>
        <div className="bg-gray-eo h-full w-[1px]"></div>
        <div className="w-1/2 sm:w-1/5 flex justify-center items-center px-3 sm:px-8 gap-4">
          {/* TODO: sticky or fixed only on y axis for ipad, investigate fixed in other parts of app */}
          <a
            href="https://argoagora.notion.site/Optimism-Agora-FAQ-3922ac9c66e54a21b5de16be9e0cf79c"
            rel="noreferrer nonopener"
            target="_blank"
          >
            Learn
          </a>
          <a
            href="https://app.deform.cc/form/7180b273-7662-4f96-9e66-1eae240a52bc/"
            rel="noreferrer nonopener"
            target="_blank"
          >
            Help
          </a>
          <a
            href="https://warpcast.com/agora"
            rel="noreferrer nonopener"
            target="_blank"
          >
            <Image src={farcaster} alt="Farcaster" />
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
    </div>
  );
}
