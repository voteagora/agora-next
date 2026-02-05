"use client";

import ProposalTooltipEmbed from "./ProposalTooltipEmbed";
import DelegateTooltipEmbed from "./DelegateTooltipEmbed";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type InternalLinkEmbedProps = {
  href: string;
  originalLink: React.ReactNode;
};

export default function InternalLinkEmbed({
  href,
  originalLink,
}: InternalLinkEmbedProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (isExpanded && contentRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setHeight(entry.contentRect.height);
        }
      });
      resizeObserver.observe(contentRef.current);
      const initialHeight = contentRef.current.scrollHeight;
      setHeight(initialHeight);
      return () => resizeObserver.disconnect();
    } else {
      setHeight(0);
    }
  }, [isExpanded]);

  let url: URL;
  try {
    url = new URL(href, window.location.origin);
  } catch {
    return <>{originalLink}</>;
  }

  if (url.origin !== window.location.origin) {
    return <>{originalLink}</>;
  }

  const pathname = url.pathname;
  const proposalMatch = pathname.match(/^\/proposals\/([^\/]+)$/);
  const delegateMatch = pathname.match(/^\/delegates\/([^\/]+)$/);

  if (!proposalMatch && !delegateMatch) {
    return <>{originalLink}</>;
  }

  const proposalId = proposalMatch?.[1];
  const addressOrENSName = delegateMatch?.[1];

  return (
    <span className="inline-flex flex-col align-baseline">
      <span className="inline-flex items-center gap-2 group/link">
        {originalLink}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          onMouseDown={(e) => {
            e.preventDefault();
          }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium transition-all",
            "border border-line bg-wash hover:bg-neutral hover:border-primary/20",
            "text-secondary hover:text-primary",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
            "touch-manipulation",
            "shadow-sm hover:shadow-md",
            isExpanded && "bg-neutral border-primary/30 text-primary"
          )}
          aria-label={isExpanded ? "Hide preview" : "Show preview"}
          aria-expanded={isExpanded}
        >
          <Eye className="w-3 h-3" />
          <span className="hidden sm:inline">
            {isExpanded ? "Hide" : "Preview"}
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="sm:hidden"
          >
            <ChevronDown className="w-3 h-3" />
          </motion.div>
        </button>
      </span>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{
              opacity: 1,
              height: height,
              marginTop: 8,
            }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div
              ref={contentRef}
              className="[&_a]:no-underline [&_a]:hover:no-underline w-full max-w-full overflow-x-auto"
            >
              <div className="inline-block min-w-0">
                {proposalId && <ProposalTooltipEmbed proposalId={proposalId} />}
                {addressOrENSName && (
                  <DelegateTooltipEmbed addressOrENSName={addressOrENSName} />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
