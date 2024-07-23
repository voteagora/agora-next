import {
  ProposalStage as PrismaProposalStage,
  ProposalDraft,
  ProposalDraftTransaction,
  ProposalSocialOption,
} from "@prisma/client";

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

export enum ApprovalProposalType {
  THRESHOLD = "Threshold",
  TOP_CHOICES = "Top choices",
}

export enum ProposalType {
  // might make sense to move snapshot to something else since snapshot isn't really a "proposal"
  // It doesn't go through the governor
  SOCIAL = "social",
  BASIC = "basic",
  APPROVAL = "approval",
  OPTIMISTIC = "optimistic",
}

export const ProposalTypeMetadata = {
  [ProposalType.SOCIAL]: {
    title: "Social Proposal",
    description: "A proposal that resolves via a snapshot vote.",
  },
  [ProposalType.BASIC]: {
    title: "Basic Proposal",
    description: "A basic proposal.",
  },
  [ProposalType.APPROVAL]: {
    title: "Approval Proposal",
    description: "An approval proposal.",
  },
  [ProposalType.OPTIMISTIC]: {
    title: "Optimistic Proposal",
    description: "An optimistic proposal.",
  },
} as {
  [key in ProposalType]: {
    title: string;
    description: string;
  };
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
  proposalTypes: any[];
  // custom copy for the proposal lifecycle feature
  copy: any;
  // optional config for including snapshot as a proposal type
  snapshotConfig?: {
    domain: string;
  };
};

export type BasicProposal = ProposalDraft & {
  proposal_type: ProposalType.BASIC;
  transactions: ProposalDraftTransaction[];
};

export type SocialProposal = ProposalDraft & {
  proposal_type: ProposalType.SOCIAL;
  end_date_social: Date;
  start_date_social: Date;
  proposal_social_type: SocialProposalType;
  social_options: ProposalSocialOption[];
};

export type ApprovalProposal = ProposalDraft & {
  proposal_type: ProposalType.APPROVAL;
  budget: string;
  criteria: ApprovalProposalType;
  max_options: number;
  threshold: number;
  top_choices: number;
  options: ProposalDraftTransaction[];
};

export type OptimisticProposal = ProposalDraft & {
  proposal_type: ProposalType.OPTIMISTIC;
};

export type DraftProposal =
  | BasicProposal
  | SocialProposal
  | ApprovalProposal
  | OptimisticProposal;

// Used to translate a draftProposal database record into its form representation
export const parseProposalToForm = (proposal: DraftProposal) => {
  switch (proposal.proposal_type) {
    case ProposalType.BASIC:
      return {
        type: ProposalType.BASIC,
        title: proposal.title,
        abstract: proposal.abstract,
        transactions: proposal.transactions,
      };
    case ProposalType.SOCIAL:
      return {
        type: ProposalType.SOCIAL,
        title: proposal.title,
        abstract: proposal.abstract,
        start_date: proposal.start_date_social,
        end_date: proposal.end_date_social,
        options: proposal.social_options,
      };
    case ProposalType.APPROVAL:
      return {
        type: ProposalType.APPROVAL,
        title: proposal.title,
        abstract: proposal.abstract,
        budget: proposal.budget,
        criteria: proposal.criteria,
        maxOptions: proposal.max_options,
        threshold: proposal.threshold,
        topChoices: proposal.top_choices,
        options: proposal.options,
      };
    case ProposalType.OPTIMISTIC:
      return {
        type: ProposalType.OPTIMISTIC,
        title: proposal.title,
        abstract: proposal.abstract,
      };
  }
};
