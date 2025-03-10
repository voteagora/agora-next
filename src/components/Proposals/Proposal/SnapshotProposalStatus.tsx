import { Proposal } from "@/app/api/common/proposals/proposal";
import { ParsedProposalData } from "@/lib/proposalUtils";
import { pluralize } from "@/lib/utils";

export default function SnapshotProposalStatus({
  proposal,
}: {
  proposal: Proposal;
}) {
  const proposalData =
    proposal.proposalData as ParsedProposalData["SNAPSHOT"]["kind"];
  const isCopeland = proposalData.type === "copeland";

  if (isCopeland) {
    return (
      <div className="flex flex-col items-end">
        <div className="text-xs text-secondary">Rank up to</div>
        <div className="flex flex-row gap-1">
          {pluralize("Option", proposalData.scores.length)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end">
      {(proposal.proposalData as any).scores.length} Choices
    </div>
  );
}
