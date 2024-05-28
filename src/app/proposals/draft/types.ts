import { ParsedProposalData } from "@/lib/proposalUtils";
import {
  ProposalType as PrismaProposalType,
  ProposalStage as PrismaProposalStage,
} from "@prisma/client";

/**
 * This is my attempt at "generalizing" the lifecycle stages of a proposal before actually generalizing it
 * I think to properly generalize it, we need to have a way to define the stages in the db so we aren't
 * hardcoding them here.
 *
 * The idea is that we have a list of stages that are shared across all tenants. These stages have metadata
 * so we can pull things like description and title from them.
 *
 * Then, each tenant defines the order of these stages and which ones are pre-submission.
 * This way all tenants are sharing the same core stages and we can build UI components that are shared
 * but each tenant is able to customize the order and existence of certain stages.
 */
type TenantProposalLifecycleStage = {
  stage: PrismaProposalStage;
  order: number;
  isPreSubmission: boolean;
};

export const ENS_PROPOSAL_LIFECYCLE_STAGES: TenantProposalLifecycleStage[] = [
  {
    stage: PrismaProposalStage.TEMP_CHECK,
    order: 0,
    isPreSubmission: true,
  },
  {
    stage: PrismaProposalStage.DRAFT,
    order: 1,
    isPreSubmission: true,
  },
  {
    stage: PrismaProposalStage.GITHUB_PR,
    order: 2,
    isPreSubmission: true,
  },
  {
    stage: PrismaProposalStage.READY,
    order: 3,
    isPreSubmission: true,
  },
  {
    stage: PrismaProposalStage.QUEUE,
    order: 4,
    isPreSubmission: false,
  },
  {
    stage: PrismaProposalStage.EXECUTE,
    order: 5,
    isPreSubmission: false,
  },
];

export const ProposalLifecycleStageMetadata = {
  [PrismaProposalStage.TEMP_CHECK]: {
    title: "Create temp check",
    shortTitle: "Temp check",
    description: "Check the temperature of the proposal",
    waitingFor: "Submitting temp check",
    checklistItems: ["Discourse temp check"],
  },
  [PrismaProposalStage.DRAFT]: {
    title: "Create draft",
    shortTitle: "Draft",
    description: "Draft the proposal",
    waitingFor: "Submitting draft",
    checklistItems: ["Transaction simulation"],
  },
  [PrismaProposalStage.GITHUB_PR]: {
    title: "Create Github PR",
    shortTitle: "Github PR",
    description: "Create a Github PR for the proposal",
    waitingFor: "Submitting Github PR",
    checklistItems: ["ENS docs updated"],
  },
  [PrismaProposalStage.READY]: {
    title: "Submit draft",
    shortTitle: "Ready",
    description: "Ready to submit the proposal",
    waitingFor: "Sponsor approval",
    checklistItems: [],
  },
  [PrismaProposalStage.QUEUE]: {
    title: "Queue",
    shortTitle: "Queue",
    description: "Queue the proposal",
    waitingFor: "Queue",
    checklistItems: [],
  },
  [PrismaProposalStage.EXECUTE]: {
    title: "Execute",
    shortTitle: "Execute",
    description: "Execute the proposal",
    waitingFor: "Execution",
    checklistItems: [],
  },
  [PrismaProposalStage.CANCELLED]: {
    title: "Cancelled",
    shortTitle: "Cancelled",
    description: "The proposal has been cancelled",
    waitingFor: "",
    checklistItems: [],
  },
} as {
  [key in PrismaProposalStage]: {
    title: string;
    shortTitle: string;
    description: string;
    waitingFor: string;
    checklistItems: string[];
  };
};

export enum SocialProposalType {
  BASIC = "basic",
  APPROVAL = "approval",
}

export enum ProposalType {
  EXECUTABLE = "executable",
  SOCIAL = "social",
}

export enum TransactionType {
  TRANSFER = "transfer",
  CUSTOM = "custom",
}

export type TempCheckFormInputs = {
  tempcheck_link: string;
};

export type TransactionFormData = {
  target: string;
  value: string;
  calldata: string;
  signature: string;
};

/**
 * The form inputs for the draft stage of a proposal.
 * @dev fields with underscore prefix are used just for form state management
 * and are not part of the actual proposal data, they do not persist to db.
 */
export type DraftFormInputs = {
  title: string;
  description: string;
  abstract: string;
  transactions: ParsedProposalData[PrismaProposalType]["kind"];
  _transactionFormData: TransactionFormData[];
  ens_docs_updated: boolean;
};

const a = {} as DraftFormInputs;
