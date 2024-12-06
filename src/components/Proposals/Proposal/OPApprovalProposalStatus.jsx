import { pluralize } from "@/lib/utils";

export default function OPApprovalProposalStatus({ proposal }) {
  const maxOptions = proposal.proposalData.proposalSettings.maxApprovals;
  return (
    <div className="flex flex-col items-end">
      <div className="text-xs text-secondary">Select {maxOptions} of</div>
      <div className="flex flex-row gap-1">
        {pluralize("Option", proposal.proposalData.options.length)}
      </div>
    </div>
  );
}
