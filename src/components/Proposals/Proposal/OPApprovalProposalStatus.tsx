import { pluralize } from "@/lib/utils";
import { type Proposal } from "@/app/api/common/proposals/proposal";
import { ParsedProposalData } from "@/lib/proposalUtils";

type ApprovalStatusViewProps = {
  maxOptions: number;
  optionCount: number;
};

export function ApprovalStatusView({
  maxOptions,
  optionCount,
}: ApprovalStatusViewProps) {
  return (
    <div className="flex flex-col items-end">
      <div className="text-xs text-secondary">Select {maxOptions} of</div>
      <div className="flex flex-row gap-1">
        {pluralize("Option", optionCount)}
      </div>
    </div>
  );
}

export default function OPApprovalProposalStatus({
  proposal,
}: {
  proposal: Proposal;
}) {
  const proposalData =
    proposal.proposalData as ParsedProposalData["APPROVAL"]["kind"];
  const maxOptions = proposalData.proposalSettings.maxApprovals;
  return (
    <ApprovalStatusView
      maxOptions={maxOptions}
      optionCount={proposalData.options.length}
    />
  );
}

export function OffchainApprovalProposalStatus({
  proposal,
}: {
  proposal: Proposal;
}) {
  const proposalData =
    proposal.proposalData as ParsedProposalData["OFFCHAIN_APPROVAL"]["kind"];
  const maxOptions = proposalData.choices.length;
  return (
    <ApprovalStatusView
      maxOptions={maxOptions}
      optionCount={proposalData.choices.length}
    />
  );
}

export type ApprovalStatusData = ApprovalStatusViewProps;
