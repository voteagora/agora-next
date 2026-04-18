import { ProposalStage } from "@prisma/client";
import { DraftProposal } from "../types";
import { getDraftStageComponent } from "./registry";

export default function DraftProposalForm({
  stage,
  draftProposal,
  proposalTypes,
}: {
  stage: ProposalStage;
  draftProposal: DraftProposal;
  proposalTypes: any[];
}) {
  const DraftStage = getDraftStageComponent(stage);

  if (!DraftStage) {
    return null;
  }

  return (
    <DraftStage draftProposal={draftProposal} proposalTypes={proposalTypes} />
  );
}
