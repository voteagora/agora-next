"use client";

import { Proposal } from "@/app/api/common/proposals/proposal";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import { formatDistanceToNow } from "date-fns";
import { useForumPermissionsContext } from "@/contexts/ForumPermissionsContext";
import { canCreateGovernanceProposal } from "@/lib/forumPermissionUtils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type RangeProposalType = {
  min_quorum_pct: number;
  max_quorum_pct: number;
  min_approval_threshold_pct: number;
  max_approval_threshold_pct: number;
};

export default function ArchiveProposalTypeApproval({
  proposal,
}: {
  proposal: Proposal;
}) {
  const permissions = useForumPermissionsContext();
  const router = useRouter();

  // Check if this is an archive proposal with metadata
  const archiveMetadata = (
    proposal as unknown as {
      archiveMetadata?: {
        source?: string;
        rawProposalType?: any;
        defaultProposalTypeRanges?: any;
      };
    }
  ).archiveMetadata;

  // Only show for eas-oodao proposals
  if (archiveMetadata?.source !== "eas-oodao") {
    return null;
  }

  // Check for default_proposal_type_ranges (pending approval)
  const defaultProposalTypeRanges =
    archiveMetadata.defaultProposalTypeRanges as RangeProposalType | undefined;

  const minQuorum = defaultProposalTypeRanges
    ? defaultProposalTypeRanges.min_quorum_pct / 100
    : null;
  const maxQuorum = defaultProposalTypeRanges
    ? defaultProposalTypeRanges.max_quorum_pct / 100
    : null;
  const minApproval = defaultProposalTypeRanges
    ? defaultProposalTypeRanges.min_approval_threshold_pct / 100
    : null;
  const maxApproval = defaultProposalTypeRanges
    ? defaultProposalTypeRanges.max_approval_threshold_pct / 100
    : null;

  // Calculate time remaining
  const endTime = proposal.endTime;
  const timeRemaining = endTime
    ? formatDistanceToNow(endTime, { addSuffix: true })
    : "Unavailable";

  // Check if proposal is successful and user has permissions
  const isSuccessful =
    proposal.status === "EXECUTED" || proposal.status === "SUCCEEDED";
  const canCreateProposal = canCreateGovernanceProposal(permissions, true);
  const showCreateButton = isSuccessful && canCreateProposal;

  const handleCreateGovProposal = () => {
    const params = new URLSearchParams({
      type: "gov-proposal",
      fromTempCheckId: proposal.id,
      title: proposal.markdowntitle || "",
      description: proposal.description || "",
      createdAt:
        proposal.createdTime?.toISOString() || new Date().toISOString(),
    });

    router.push(`/create?${params.toString()}`);
  };
  const now = new Date();

  if (
    !showCreateButton &&
    !minQuorum &&
    !maxQuorum &&
    !minApproval &&
    !maxApproval
  ) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-[#f3f3f1] p-4 shadow-sm pb-[60px] mb-[-40px]">
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
      ) : (
        <>
          {endTime && endTime > now && (
            <div className="flex items-center justify-between text-xs font-semibold text-secondary">
              <span className="inline-flex items-center gap-2">
                Proposal type not yet approved
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InformationCircleIcon className="h-4 w-4 cursor-pointer text-secondary hover:text-primary" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs text-secondary">
                      This temp check still needs admin approval with proposal
                      type before it can proceed to a governance proposal.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <span>{timeRemaining}</span>
            </div>
          )}

          <div className="mt-4 space-y-2 text-xs font-semibold text-secondary">
            <div className="flex items-center justify-between">
              <span>Quorum</span>
              <span>
                {minQuorum}% – {maxQuorum}% until type approved
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Approval Threshold</span>
              <span>
                {minApproval}% – {maxApproval}% until type approved
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
