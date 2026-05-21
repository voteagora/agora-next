"use client";

import React from "react";
import { generatePatternSvg } from "@/lib/utils/generatePatternSvg";
import Tenant from "@/lib/tenant/tenant";

const DEFAULT_COLORS = ["#6B7280", "#4B5563", "#374151", "#1F2937"];

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
  index?: number;
}

// Attempt to create a visually distinct accent from the background
function createPatternAccent(hex: string): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);

  // Perceived brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // For dark colors, lighten significantly; for light colors, darken significantly
  const shift = brightness < 128 ? 60 : -60;

  const nr = Math.min(255, Math.max(0, r + shift));
  const ng = Math.min(255, Math.max(0, g + shift));
  const nb = Math.min(255, Math.max(0, b + shift));

  return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
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
  index = 0,
}: FinancialStatementCardProps) {
  const { ui } = Tenant.current();
  const colors = ui.documentColors ?? DEFAULT_COLORS;
  const bgColor = colors[index % colors.length];
  const accentColor = createPatternAccent(bgColor);

  const metadataString = `${document.ipfsCid}-${document.name}-${document.createdAt}`;
  const { svg: patternSvg } = generatePatternSvg(
    metadataString,
    400,
    280,
    bgColor,
    accentColor,
    undefined,
    ui.theme
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
              <span className="inline-block px-3 py-1 rounded-lg text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-900 shadow-sm">
                Recently released
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-white line-clamp-2 mb-auto drop-shadow-md">
            {displayName}
          </h3>
        </div>
        <div className="relative h-[280px] overflow-hidden">
          <div
            dangerouslySetInnerHTML={{ __html: patternSvg }}
            className="w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
