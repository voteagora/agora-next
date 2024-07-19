import { ProposalStage as PrismaProposalStage } from "@prisma/client";

type TenantProposalLifecycleStage = {
  stage: PrismaProposalStage;
  order: number;
  isPreSubmission: boolean;
  config?: any;
};

export const ProposalLifecycleStageMetadata = {
  [PrismaProposalStage.ADDING_TEMP_CHECK]: {
    title: "Create temp check",
    shortTitle: "Temp check",
    description: "Check the temperature of the proposal",
    waitingFor: "Submitting temp check",
    checklistItems: ["Discourse temp check"],
  },
  [PrismaProposalStage.DRAFTING]: {
    title: "Create draft",
    shortTitle: "Draft",
    description: "Draft the proposal",
    waitingFor: "Submitting draft",
    checklistItems: ["Transaction simulation"],
  },
  [PrismaProposalStage.ADDING_GITHUB_PR]: {
    title: "Create Github PR",
    shortTitle: "Github PR",
    description: "Create a Github PR for the proposal",
    waitingFor: "Submitting Github PR",
    checklistItems: ["ENS docs updated"],
  },
  [PrismaProposalStage.AWAITING_SUBMISSION]: {
    title: "Submit draft",
    shortTitle: "Ready",
    description: "Ready to submit the proposal",
    waitingFor: "Sponsor approval",
    checklistItems: [],
  },
  [PrismaProposalStage.PENDING]: {
    title: "Pending",
    shortTitle: "Pending",
    description: "The proposal is pending",
    waitingFor: "Voting",
    checklistItems: [],
  },
  [PrismaProposalStage.QUEUED]: {
    title: "Queue",
    shortTitle: "Queue",
    description: "Queue the proposal",
    waitingFor: "Queue",
    checklistItems: [],
  },
  [PrismaProposalStage.EXECUTED]: {
    title: "Execute",
    shortTitle: "Execute",
    description: "Execute the proposal",
    waitingFor: "Execution",
    checklistItems: [],
  },
  [PrismaProposalStage.CANCELED]: {
    title: "Cancelled",
    shortTitle: "Cancelled",
    description: "The proposal has been cancelled",
    waitingFor: "",
    checklistItems: [],
  },
  [PrismaProposalStage.ACTIVE]: {
    title: "Active",
    shortTitle: "Active",
    description: "The proposal is active",
    waitingFor: "",
    checklistItems: [],
  },
  [PrismaProposalStage.DEFEATED]: {
    title: "Defeated",
    shortTitle: "Defeated",
    description: "The proposal has been defeated",
    waitingFor: "",
    checklistItems: [],
  },
  [PrismaProposalStage.EXPIRED]: {
    title: "Expired",
    shortTitle: "Expired",
    description: "The proposal has expired",
    waitingFor: "",
    checklistItems: [],
  },
  [PrismaProposalStage.SUCCEEDED]: {
    title: "Succeeded",
    shortTitle: "Succeeded",
    description: "The proposal has succeeded",
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

export const ProposalTypeMetadata = {
  [ProposalType.EXECUTABLE]: {
    title: "Executable Proposal",
    description: "A proposal that executes on-chain and accepts transactions.",
  },
  [ProposalType.SOCIAL]: {
    title: "Social Proposal",
    description: "A proposal that resolves via a snapshot vote.",
  },
};

export enum TransactionType {
  TRANSFER = "transfer",
  CUSTOM = "custom",
}

export type PLMConfig = {
  // the stages of the proposal lifecycle that
  // this tenant wants to use
  stages: TenantProposalLifecycleStage[];
  // We can read proposal type from the governor
  // but others might be desired, like snapshot
  additionalProposalTypes: any[];
  // custom copy for the proposal lifecycle feature
  copy: any;
};
