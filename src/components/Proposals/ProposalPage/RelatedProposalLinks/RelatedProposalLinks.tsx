"use client";

import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Clock, ExternalLink } from "lucide-react";
import { useProposalLinksWithDetails } from "@/hooks/useProposalLinksWithDetails";
import { formatRelative } from "@/components/ForumShared/utils";
import { buildForumTopicPath } from "@/lib/forumUtils";
import Tenant from "@/lib/tenant/tenant";

interface RelatedProposalLinksProps {
  proposalId: string;
}

function getHeaderText(type: string, metadata?: any) {
  if (type === "forum_topic") {
    return "Related Discussion";
  }
  return "Related Temp check";
}

function RelatedLinkCard({
  link,
}: {
  link: {
    id: string;
    type: string;
    title: string;
    description: string;
    createdAt: string;
    metadata?: {
      commentsCount?: number;
      category?: string;
      status?: string;
    };
  };
}) {
  const { ui } = Tenant.current();
  const headerText = getHeaderText(link.type, link.metadata);
  const isTempCheck = headerText === "Related Temp check";

  let linkUrl = "#";
  if (link.type === "forum_topic") {
    linkUrl = buildForumTopicPath(parseInt(link.id), link.title);
  } else {
    linkUrl = `/proposals/${link.id}`;
  }

  return (
    <div className="    border border-line rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-secondary">
            {headerText}
          </span>
          <Link href={linkUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3.5 h-3.5 text-secondary" />
          </Link>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Image
          src={ui.logo}
          alt="logo"
          width={40}
          height={40}
          className="h-10 w-10 mt-0.5 flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <Link
              href={linkUrl}
              className="flex-1 min-w-0"
              target="_blank"
              rel="noopener noreferrer"
            >
              <h3 className="text-base font-semibold text-primary hover:underline">
                {link.title}
              </h3>
            </Link>

            <div className="flex items-center gap-3 text-xs font-semibold text-secondary flex-shrink-0">
              {!isTempCheck && link.metadata?.commentsCount !== undefined && (
                <div className="inline-flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.7} />
                  <span>{link.metadata.commentsCount}</span>
                </div>
              )}
              <div className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" strokeWidth={1.7} />
                <span>{formatRelative(link.createdAt)}</span>
              </div>
              {isTempCheck && (
                <div className="inline-flex items-center gap-1.5 bg-wash px-2 py-1 rounded">
                  <span className="text-red-500">🌡️</span>
                  <span>Temp Check</span>
                </div>
              )}
            </div>
          </div>

          {link.description && (
            <p className="mt-2 text-sm text-secondary line-clamp-2">
              {link.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RelatedProposalLinks({
  proposalId,
}: RelatedProposalLinksProps) {
  const { links, isLoading } = useProposalLinksWithDetails(proposalId);

  if (isLoading || links.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {links.map((link) => (
        <RelatedLinkCard key={link.id} link={link} />
      ))}
    </div>
  );
}
