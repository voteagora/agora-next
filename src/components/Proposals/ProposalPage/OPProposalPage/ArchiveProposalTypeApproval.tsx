"use client";

import { Proposal } from "@/app/api/common/proposals/proposal";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import { useForumPermissionsContext } from "@/contexts/ForumPermissionsContext";

import { Button } from "@/components/ui/button";

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

  // Check if this is an archive proposal with metadata
  const archiveMetadata = (
    proposal as unknown as {
      archiveMetadata?: {
        source?: string;
        rawProposalType?: any;
      };
    }
  ).archiveMetadata;

  // Only show for eas-oodao proposals
  if (archiveMetadata?.source !== "eas-oodao") {
    return null;
  }

  const rawProposalType = archiveMetadata.rawProposalType as
    | RangeProposalType
    | undefined;

  // Only show for RangeProposalType (has min/max percentages)
  if (!rawProposalType || !("min_quorum_pct" in rawProposalType)) {
    return null;
  }

  const minQuorum = rawProposalType.min_quorum_pct / 100;
  const maxQuorum = rawProposalType.max_quorum_pct / 100;
  const minApproval = rawProposalType.min_approval_threshold_pct / 100;
  const maxApproval = rawProposalType.max_approval_threshold_pct / 100;

  // Calculate days left
  const endTime = proposal.endTime;
  const now = new Date();
  const daysLeft = endTime
    ? Math.max(
        0,
        Math.ceil((endTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      )
    : 0;

  // Check if proposal is successful and user has permissions
  const isSuccessful =
    proposal.status === "EXECUTED" || proposal.status === "SUCCEEDED";
  const canCreateProposal = permissions.canCreateTopic;
  const showCreateButton = isSuccessful && canCreateProposal;

  if (showCreateButton) {
    return (
      <div className="relative mb-6 h-64 rounded-2xl border border-black/10 bg-[#f3f3f1] p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="w-[151px] text-xs font-semibold text-[#444444]">
            You are eligible to turn this into a gov proposal
          </div>
          <Button className="bg-neutral-900 px-5 py-3 text-xs font-semibold text-white">
            Create gov proposal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-black/10 bg-[#f3f3f1] p-4 shadow-sm pb-[60px] mb-[-40px]">
      <div className="flex items-center justify-between text-xs font-semibold text-secondary">
        <span className="inline-flex items-center gap-2">
          <InformationCircleIcon className="h-4 w-4" />
          Proposal type not yet approved
        </span>
        <span>{daysLeft} days left</span>
      </div>

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
    </div>
  );
}
