"use client";

import ProposalEmbed from "./ProposalEmbed";
import DelegateEmbed from "./DelegateEmbed";

type InternalLinkEmbedProps = {
  href: string;
  originalLink: React.ReactNode;
};

export default function InternalLinkEmbed({
  href,
  originalLink,
}: InternalLinkEmbedProps) {
  let pathname: string;
  try {
    const url = new URL(href, window.location.origin);
    pathname = url.pathname;
  } catch {
    return <>{originalLink}</>;
  }

  const proposalMatch = pathname.match(/^\/proposals\/([^\/]+)$/);
  if (proposalMatch) {
    const proposalId = proposalMatch[1];
    return <ProposalEmbed proposalId={proposalId} />;
  }

  const delegateMatch = pathname.match(/^\/delegates\/([^\/]+)$/);
  if (delegateMatch) {
    const addressOrENSName = delegateMatch[1];
    return <DelegateEmbed addressOrENSName={addressOrENSName} />;
  }

  return <>{originalLink}</>;
}
