"use client";

import React from "react";
import { generatePatternSvg } from "@/lib/utils/generatePatternSvg";

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
  const { svg: patternSvg, bgColor } = generatePatternSvg(
    metadataString,
    400,
    280
  );

  const displayName = removeFileExtension(document.name);

  return (
    <div
      className={`relative rounded-lg overflow-hidden cursor-pointer transition-all`}
      style={{
        background: bgColor,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
      onClick={onCardClick}
    >
      <div className="w-[320px] flex flex-col">
        <div className="flex-1 p-5 flex flex-col min-h-[120px]">
          {isRecentlyReleased && (
            <div className="mb-3">
              <span className="inline-block px-3 py-1 rounded-lg text-xs font-medium bg-neutral text-primary">
                Recently released
              </span>
            </div>
          )}
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-auto">
            {displayName}
          </h3>
        </div>
        <div className="relative h-[280px] overflow-hidden">
          <div
            dangerouslySetInnerHTML={{ __html: patternSvg }}
            className="w-full h-full"
            style={{
              filter: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
