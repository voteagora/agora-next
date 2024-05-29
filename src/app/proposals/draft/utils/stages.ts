import {
  ProposalLifecycleStageMetadata,
  ENS_PROPOSAL_LIFECYCLE_STAGES,
} from "../types";
import { ProposalStage } from "@prisma/client";

/**
 * TODO:
 * Eventually want to abstract this into the UI factory
 * This is a way for tenant to define which stages are available
 */
export const DRAFT_STAGES_FOR_TENANT = ENS_PROPOSAL_LIFECYCLE_STAGES.filter(
  (stage) => stage.isPreSubmission
);

export const POST_DRAFT_STAGES_FOR_TENANT =
  ENS_PROPOSAL_LIFECYCLE_STAGES.filter((stage) => !stage.isPreSubmission);

/**
 * getStageMetadata
 * @param stage
 * @returns metadata for the stage (title, description)
 * Helper function to get the metadata for a given stage
 */
export const getStageMetadata = (stage: ProposalStage) => {
  return ProposalLifecycleStageMetadata[
    stage as keyof typeof ProposalLifecycleStageMetadata
  ];
};

export const getStageIndexForTenant = (stage: ProposalStage) => {
  return ENS_PROPOSAL_LIFECYCLE_STAGES.find((s) => s.stage === stage)?.order;
};

export const isPostSubmission = (stage: ProposalStage) => {
  return POST_DRAFT_STAGES_FOR_TENANT.some((s) => s.stage === stage);
};
