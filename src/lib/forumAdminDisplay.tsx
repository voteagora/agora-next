"use client";

import ENSName from "@/components/shared/ENSName";
import { isCivicDemoEnabled } from "@/mocks/civicDemoProposals";

export {
  getForumAdminBadgeType,
  getForumSidebarAdminBadgeType,
  getForumSidebarAdminLabel,
} from "@/lib/forumAdminDisplayUtils";

export function ForumAuthorName({
  address,
  isAdmin,
}: {
  address: string;
  isAdmin: boolean;
}) {
  if (isAdmin && !isCivicDemoEnabled()) {
    return <span className="text-primary">Cowrie</span>;
  }

  return <ENSName address={address} />;
}
