"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";

// Function to decode HTML entities
function decodeHtmlEntities(text: string): string {
  // More robust HTML entity decoding
  const entities: { [key: string]: string } = {
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&quot;": '"',
    "&#39;": "'",
    "&nbsp;": " ",
  };

  let decoded = text;
  Object.entries(entities).forEach(([entity, char]) => {
    decoded = decoded.replace(new RegExp(entity, "g"), char);
  });

  return decoded;
}

interface DunaContentRendererProps {
  content: string;
  className?: string;
}

export default function DunaContentRenderer({
  content,
  className,
}: DunaContentRendererProps) {
  if (!content) return null;

  const { ui } = Tenant.current();

  // Decode HTML entities if they exist
  const decodedContent = decodeHtmlEntities(content);

  return (
    <div
      data-testid="duna-content"
      className={cn(
        "text-sm prose prose-sm max-w-none",
        ui.customization?.cardBackground
          ? "prose-p:text-white prose-blockquote:text-white prose-code:text-white prose-pre:text-white prose-headings:text-white prose-strong:text-white prose-b:text-white prose-em:text-white prose-i:text-white prose-del:text-white prose-ins:text-white prose-mark:text-white prose-s:text-white prose-a:text-white prose-li:text-white prose-ul:text-white prose-ol:text-white prose-img:rounded-lg"
          : "prose-a:text-primary prose-a:underline hover:prose-a:no-underline prose-img:rounded-lg",
        "prose-a:font-medium prose-img:max-w-full prose-img:h-auto prose-img:my-2",
        className
      )}
      dangerouslySetInnerHTML={{ __html: decodedContent }}
      style={{
        // Force some basic styling to ensure content is visible
        color: ui.customization?.cardBackground ? "white" : "inherit",
        fontSize: "inherit",
        lineHeight: "inherit",
      }}
    />
  );
}
