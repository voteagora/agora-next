"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ProposalTooltipEmbed from "./ProposalTooltipEmbed";
import DelegateTooltipEmbed from "./DelegateTooltipEmbed";

type InternalLinkEmbedProps = {
  href: string;
  originalLink: React.ReactNode;
};

export default function InternalLinkEmbed({
  href,
  originalLink,
}: InternalLinkEmbedProps) {
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
  if (proposalMatch) {
    const proposalId = proposalMatch[1];
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{originalLink}</TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-[600px] p-0 border-0 bg-transparent shadow-none [&_a]:no-underline [&_a]:hover:no-underline"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <ProposalTooltipEmbed proposalId={proposalId} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const delegateMatch = pathname.match(/^\/delegates\/([^\/]+)$/);
  if (delegateMatch) {
    const addressOrENSName = delegateMatch[1];
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{originalLink}</TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-md p-0 border-0 bg-transparent shadow-none [&_a]:no-underline [&_a]:hover:no-underline"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <DelegateTooltipEmbed addressOrENSName={addressOrENSName} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <>{originalLink}</>;
}
