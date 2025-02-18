import { pluralize } from "@/lib/utils";

export interface ProposalSettings {
  maxApprovals: number;
}

export interface ProposalData {
  proposalSettings: ProposalSettings;
  options: any[];
}

export interface ProposalProps {
  proposal: {
    proposalData: ProposalData;
  };
}

export default function OPApprovalProposalStatus({ proposal }: ProposalProps) {
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
