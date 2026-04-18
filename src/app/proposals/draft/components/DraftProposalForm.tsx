import { ProposalStage } from "@prisma/client";
import { DraftProposal, DraftProposalTypeOption } from "../types";
import { getDraftStageComponent } from "./registry";

export default function DraftProposalForm({
  stage,
  draftProposal,
  proposalTypes,
}: {
  stage: ProposalStage;
  draftProposal: DraftProposal;
  proposalTypes: DraftProposalTypeOption[];
}) {
  const DraftStage = getDraftStageComponent(stage);

  if (!DraftStage) {
    return null;
  }

  return (
    <DraftStage draftProposal={draftProposal} proposalTypes={proposalTypes} />
  );
}
