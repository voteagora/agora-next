"use client";

import React from "react";
import { generatePatternSvg } from "@/lib/utils/generatePatternSvg";
import Tenant from "@/lib/tenant/tenant";

interface FinancialStatementCardProps {
  document: {
    id: number;
    name: string;
    url: string;
    ipfsCid: string;
    createdAt: string;
    uploadedBy: string;
    archived?: boolean;
    revealTime?: string | null;
    expirationTime?: string | null;
  };
  onCardClick: () => void;
  isRecentlyReleased?: boolean;
  isArchived?: boolean;
}

function removeFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return filename;
  return filename.substring(0, lastDotIndex);
}

export default function FinancialStatementCard({
  document,
  onCardClick,
  isRecentlyReleased = false,
}: FinancialStatementCardProps) {
  const metadataString = `${document.ipfsCid}-${document.name}-${document.createdAt}`;
  const mode = Tenant.current().ui.theme;
  const { svg: patternSvg, bgColor } = generatePatternSvg(
    metadataString,
    400,
    280,
    undefined,
    undefined,
    undefined,
    mode
  );

  const displayName = removeFileExtension(document.name);

  return (
    <div
      className="relative rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg group"
      style={{
        background: bgColor,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
      }}
      onClick={onCardClick}
    >
      <div className="w-[320px] flex flex-col">
        <div className="flex-1 p-4 flex flex-col min-h-[120px] relative z-10">
          <div className="mb-2 min-h-[28px]">
            {isRecentlyReleased && (
              <span className="inline-block px-3 py-1 rounded-lg text-xs font-medium bg-neutral backdrop-blur-sm text-primary shadow-sm">
                Recently released
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-primary line-clamp-2 mb-auto drop-shadow-sm">
            {displayName}
          </h3>
        </div>
        <div className="relative h-[280px] overflow-hidden">
          <div
            dangerouslySetInnerHTML={{ __html: patternSvg }}
            className="w-full h-full transition-transform duration-500 group-hover:scale-105"
            style={{
              filter: "none",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
