import { Suspense } from "react";
import type { ComponentType } from "react";

import { ProposalStage } from "@prisma/client";

import { DraftProposal, DraftProposalTypeOption } from "../types";
import DraftFormClient from "./stages/DraftForm/DraftFormClient";
import GithubPRForm from "./stages/GithubPRForm";
import SubmitForm from "./stages/SubmitForm";
import TempCheckForm from "./stages/TempCheckForm";

export type DraftStageProps = {
  draftProposal: DraftProposal;
  proposalTypes: DraftProposalTypeOption[];
};

export type DraftStageComponent = ComponentType<DraftStageProps>;

const TempCheckStage: DraftStageComponent = ({ draftProposal }) => (
  <TempCheckForm draftProposal={draftProposal} />
);

const DraftingStage: DraftStageComponent = ({
  draftProposal,
  proposalTypes,
}) => (
  <Suspense fallback={"loading!"}>
    <DraftFormClient
      proposalTypes={proposalTypes}
      draftProposal={draftProposal}
    />
  </Suspense>
);

const GithubPRStage: DraftStageComponent = ({ draftProposal }) => (
  <GithubPRForm draftProposal={draftProposal} />
);

const AwaitingSubmissionStage: DraftStageComponent = ({ draftProposal }) => (
  <SubmitForm draftProposal={draftProposal} />
);

export const DRAFT_STAGE_REGISTRY: Partial<
  Record<ProposalStage, DraftStageComponent>
> = {
  [ProposalStage.ADDING_TEMP_CHECK]: TempCheckStage,
  [ProposalStage.DRAFTING]: DraftingStage,
  [ProposalStage.ADDING_GITHUB_PR]: GithubPRStage,
  [ProposalStage.AWAITING_SUBMISSION]: AwaitingSubmissionStage,
};

export function getDraftStageComponent(
  stage: ProposalStage
): DraftStageComponent | null {
  return DRAFT_STAGE_REGISTRY[stage] ?? null;
}
