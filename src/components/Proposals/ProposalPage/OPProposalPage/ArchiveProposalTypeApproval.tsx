"use client";

import { Proposal } from "@/app/api/common/proposals/proposal";
import { useForumPermissionsContext } from "@/contexts/ForumPermissionsContext";
import { canCreateGovernanceProposal } from "@/lib/forumPermissionUtils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { RelatedItem } from "@/app/create/types";
import { useProposalLinksWithDetails } from "@/hooks/useProposalLinksWithDetails";
import Tenant from "@/lib/tenant/tenant";
import { cn } from "@/lib/utils";

export default function ArchiveProposalTypeApproval({
  proposal,
}: {
  proposal: Proposal;
}) {
  const permissions = useForumPermissionsContext();
  const router = useRouter();
  const { address } = useAccount();
  const { links: relatedLinks, isLoading: isLoadingLinks } =
    useProposalLinksWithDetails(proposal.id);
  const hasLinkedGovProposal = relatedLinks.some((link) => link.type === "gov");

  const archiveMetadata = (
    proposal as unknown as {
      archiveMetadata?: {
        source?: string;
        rawTag?: string;
      };
    }
  ).archiveMetadata;
  const isTempCheck = archiveMetadata?.rawTag === "tempcheck";
  const { namespace, ui } = Tenant.current();
  const isDark = ui.theme === "dark";

  if (archiveMetadata?.source !== "eas-oodao") {
    return null;
  }

  const isDefeated = proposal.status === "DEFEATED";
  const isSuccessful = proposal.status === "SUCCEEDED";

  const isAuthor = address?.toLowerCase() === proposal.proposer?.toLowerCase();
  const canCreateProposal = canCreateGovernanceProposal(
    permissions,
    [{ status: "SUCCEEDED" } as RelatedItem],
    isAuthor
  );

  const showCreateDiscussionButton = isTempCheck
    ? isDefeated && permissions.canCreateTopic
    : (isDefeated || isSuccessful) && permissions.canCreateTopic;

  const showCreateButton =
    isSuccessful &&
    canCreateProposal &&
    !isLoadingLinks &&
    !hasLinkedGovProposal &&
    isTempCheck;

  const handleCreateGovProposal = () => {
    const params = new URLSearchParams({
      type: "gov-proposal",
      fromTempCheckId: proposal.id,
    });

    router.push(`/create?${params.toString()}`);
  };

  const handleCreateDiscussion = () => {
    const params = new URLSearchParams({
      fromProposalId: proposal.id,
      proposalTag: isTempCheck ? "tempcheck" : "gov",
    });

    router.push(`/forums/new?${params.toString()}`);
  };

  if (!showCreateButton && !showCreateDiscussionButton) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-sm pb-[60px] mb-[-40px]",
        isDark
          ? "bg-cardBackground text-primary border-line"
          : "bg-[#f3f3f1] text-[#444444] border-black/10"
      )}
    >
      {showCreateButton ? (
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="w-[151px] text-xs font-semibold text-[#444444]">
              You are eligible to turn this into a gov proposal
            </div>
            <Button
              className="px-5 py-3 text-xs font-semibold"
              onClick={handleCreateGovProposal}
            >
              Create gov proposal
            </Button>
          </div>
        </div>
      ) : showCreateDiscussionButton ? (
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="w-[151px] text-xs font-semibold text-[#444444]">
              Want to discuss this {isTempCheck ? "temp check" : "proposal"}{" "}
              further?
            </div>
            <Button
              className="px-5 py-3 text-xs font-semibold"
              onClick={handleCreateDiscussion}
            >
              Create discussion
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
