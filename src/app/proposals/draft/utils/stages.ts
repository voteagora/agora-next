import {
  PLMConfig,
  ProposalLifecycleStageMetadata,
  ProposalType,
} from "../types";

import { ProposalStage } from "@prisma/client";
import Tenant from "@/lib/tenant/tenant";

export const GET_DRAFT_STAGES = () => {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");

  if (!plmToggle || !plmToggle.config) {
    throw new Error(
      `Proposal lifecycle toggle not found for tenant ${tenant.ui.title}`
    );
  }

  return (plmToggle.config as PLMConfig).stages.filter(
    (stage) => stage.isPreSubmission
  );
};

export const GET_POST_DRAFT_STAGES = () => {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");

  if (!plmToggle || !plmToggle.config) {
    throw new Error(
      `Proposal lifecycle toggle not found for tenant ${tenant.ui.title}`
    );
  }

  return (plmToggle.config as PLMConfig).stages.filter(
    (stage) => !stage.isPreSubmission
  );
};

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
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");

  if (!plmToggle || !plmToggle.config) {
    throw new Error(
      `Proposal lifecycle toggle not found for tenant ${tenant.ui.title}`
    );
  }

  return (plmToggle.config as PLMConfig).stages.find((s) => s.stage === stage)
    ?.order;
};

export const getStageByIndex = (index: number) => {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");

  if (!plmToggle || !plmToggle.config) {
    throw new Error(
      `Proposal lifecycle toggle not found for tenant ${tenant.ui.title}`
    );
  }

  const stages = (plmToggle.config as PLMConfig).stages;
  if (!stages || stages.length - 1 < index) {
    throw new Error("Index out of bounds.");
  }

  return (plmToggle.config as PLMConfig).stages[index];
};

export const isPostSubmission = (stage: ProposalStage) => {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");

  if (!plmToggle) {
    throw new Error(
      `Proposal lifecycle toggle not found for tenant ${tenant.ui.title}`
    );
  }

  const postDraftStages = GET_POST_DRAFT_STAGES()!;
  return postDraftStages.some((s) => s.stage === stage);
};

export const getProposalTypeAddress = (
  type: ProposalType
): `0x${string}` | null | undefined => {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");

  if (!plmToggle) {
    throw new Error(
      `Proposal lifecycle toggle not found for tenant ${tenant.ui.title}`
    );
  }

  if (type === ProposalType.BASIC) {
    return ("0x" + "0".repeat(40)) as `0x${string}`;
  }

  const proposalTypes = (plmToggle.config as PLMConfig).proposalTypes;
  const proposalType = proposalTypes.find((pt) => pt?.type === type);

  if (!proposalType) {
    throw new Error(`Proposal type ${type} for tenant ${tenant.ui.title}`);
  }

  return tenant.isMain ? proposalType.prodAddress : proposalType.testnetAddress;
};

export const parseError = (error: any) => {
  if (error.message.includes("one live proposal per proposer")) {
    return "You have an outstanding proposal that has not yet completed. Please wait for it to be processed before submitting or sponsoring a new one. ";
  }
  const supportsScopes = Boolean(Tenant.current().contracts.supportScopes);
  const msg = String(error?.message || "").toLowerCase();
  const cause = String(error?.cause?.message || "").toLowerCase();

  const combined = `${msg}\n${cause}`;

  const signaturesToFlag = ["0x31f837ca"];

  const indicativePhrases = [
    "unable to decode signature",
    "decodeerrorresult",
    "invalid proposal type",
    "scoped",
  ];

  const mentionsSignature = signaturesToFlag.some((sig) =>
    combined.includes(sig)
  );
  const mentionsIndicative = indicativePhrases.some((p) =>
    combined.includes(p)
  );

  if (supportsScopes && (mentionsSignature || mentionsIndicative)) {
    return (
      "This action is blocked by scopes. Please contact the DAO Admin or Manager " +
      "to refine proposal types and scope definitions."
    );
  }

  return error.message;
};
