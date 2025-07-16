import { pluralize } from "@/lib/utils";
import { type Proposal } from "@/app/api/common/proposals/proposal";
import { ParsedProposalData } from "@/lib/proposalUtils";

export default function OPApprovalProposalStatus({
  proposal,
}: {
  proposal: Proposal;
}) {
  const proposalData =
    proposal.proposalData as ParsedProposalData["APPROVAL"]["kind"];
  const maxOptions = proposalData.proposalSettings.maxApprovals;
  return (
    <div className="flex flex-col items-end">
      <div className="text-xs text-secondary">Select {maxOptions} of</div>
      <div className="flex flex-row gap-1">
        {pluralize("Option", proposalData.options.length)}
      </div>
    </div>
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
    <div className="flex flex-col items-end">
      <div className="text-xs text-secondary">Select {maxOptions} of</div>
      <div className="flex flex-row gap-1">
        {pluralize("Option", proposalData.choices.length)}
      </div>
    </div>
  );
}
