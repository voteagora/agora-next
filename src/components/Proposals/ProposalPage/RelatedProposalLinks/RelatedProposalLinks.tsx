"use client";

import Link from "next/link";
import {
  MessageCircle,
  Clock,
  ExternalLink,
  FileText,
  Thermometer,
} from "lucide-react";
import { useProposalLinksWithDetails } from "@/hooks/useProposalLinksWithDetails";
import { formatRelative } from "@/components/ForumShared/utils";
import { buildForumTopicPath } from "@/lib/forumUtils";
import Tenant from "@/lib/tenant/tenant";
import type { TenantCopy } from "@/lib/tenant/tenantCopy";

interface RelatedProposalLinksProps {
  proposalId: string;
}

function getHeaderText(
  type: string,
  relationship: "source" | "target",
  copy: TenantCopy
) {
  if (type === "forum_topic") {
    return relationship === "target"
      ? copy.forums.relatedDiscussion
      : copy.forums.referencedInDiscussion;
  }

  if (type === "tempcheck") {
    return relationship === "target"
      ? copy.forums.relatedTempCheck
      : copy.forums.referencedInTempCheck;
  }

  return relationship === "target"
    ? copy.forums.relatedProposal
    : copy.forums.referencedInProposal;
}

function getIcon(type: string) {
  if (type === "forum_topic") {
    return MessageCircle;
  }
  if (type === "tempcheck") {
    return Thermometer;
  }
  return FileText;
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
    relationship: "source" | "target";
    metadata?: {
      commentsCount?: number;
      category?: string;
      status?: string;
    };
  };
}) {
  const { ui } = Tenant.current();
  const copy = ui.copy;
  const headerText = getHeaderText(link.type, link.relationship, copy);
  const isTempCheck = link.type === "tempcheck";
  const isForumTopic = link.type === "forum_topic";
  const Icon = getIcon(link.type);

  let linkUrl = "#";
  if (link.type === "forum_topic") {
    linkUrl = buildForumTopicPath(parseInt(link.id), link.title);
  } else {
    linkUrl = `/proposals/${link.id}`;
  }

  return (
    <Link
      href={linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="border border-[#e0e0e0] rounded-lg p-3 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-secondary">
            {headerText}
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-secondary" />
        </div>
      </div>

      <div className="flex items-start gap-1">
        <div className="h-6 w-6 flex-shrink-0 flex items-center justify-center rounded-lg bg-wash">
          <Icon className="w-4 h-4 text-secondary" strokeWidth={1.7} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-primary flex-1 min-w-0">
              {link.title}
            </h3>

            <div className="flex items-center gap-3 text-xs font-semibold text-secondary flex-shrink-0">
              {isForumTopic && link.metadata?.commentsCount !== undefined && (
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
                  <span>{copy.forums.relatedTempCheck}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
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
    <div className="flex flex-col gap-3 mb-2">
      {links.map((link) => (
        <RelatedLinkCard key={link.id} link={link} />
      ))}
    </div>
  );
}
