import {
  ProposalStage as PrismaProposalStage,
  ProposalDraft,
  ProposalDraftTransaction,
  ProposalSocialOption,
  ProposalChecklist,
} from "@prisma/client";
import { decodeFunctionData, formatUnits } from "viem";
import Tenant from "@/lib/tenant/tenant";

// TODO: move this to a shared location
const transferABI = [
  {
    constant: false,
    inputs: [
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const isTransfer = (calldata: string) => {
  // Function Selector: The first 4 bytes of calldata 0xa9059cbb for transfer(address,uint256)
  // TODO: might need to add more types if we have other types of "transfers"
  return calldata.startsWith("0xa9059cbb");
};

// prisma schema spits out strings so I can't match against `0x{string}`
export type EthereumAddress = string & { __brand: "EthereumAddress" };

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
    description:
      "Voters are asked to vote for, against, or abstain. The proposal passes if the abstain and for votes exceeed quorum AND if the for votes exceed the approval threshold.",
  },
  [ProposalType.APPROVAL]: {
    title: "Approval Proposal",
    description:
      "Voters are asked to choose among multiple options. If the proposal passes quorum, options will be approved according to the approval criteria.",
  },
  [ProposalType.OPTIMISTIC]: {
    title: "Optimistic Proposal",
    description:
      "Voters are asked to vote for, against, or abstain. The proposal automatically passes unless 12% vote against. No transactions can be proposed for optimistic proposals, it can only be used for social signaling.",
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

export enum ProposalGatingType {
  MANAGER = "manager",
  TOKEN_THRESHOLD = "token threshold",
  GOVERNOR_V1 = "governor v1",
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
  // The method for gating who can create a proposal
  // Manager -- only the manager can create proposals
  // Token Threshold -- a certain amount of tokens must be held
  // OZ (ENS, UNI): Token threshold
  // Agora gov 0.1 (OP): manager
  // Agora gov 1.0+ (everyone else): manager or voting threshold
  gatingType: ProposalGatingType;
};

export type BaseProposal = ProposalDraft & {
  checklist_items: ProposalChecklist[];
};

export type BasicProposal = BaseProposal & {
  voting_module_type: ProposalType.BASIC;
  transactions: ProposalDraftTransaction[];
};

export type SocialProposal = BaseProposal & {
  voting_module_type: ProposalType.SOCIAL;
  end_date_social: Date;
  start_date_social: Date;
  proposal_social_type: SocialProposalType;
  social_options: ProposalSocialOption[];
};

export type ApprovalProposal = BaseProposal & {
  voting_module_type: ProposalType.APPROVAL;
  budget: string;
  criteria: ApprovalProposalType;
  max_options: number;
  threshold: number;
  top_choices: number;
  approval_options: ApprovalProposalOption[];
};

type ApprovalProposalOption = {
  title: string;
  transactions: ProposalDraftTransaction[];
};

export type OptimisticProposal = BaseProposal & {
  voting_module_type: ProposalType.OPTIMISTIC;
};

export type DraftProposal =
  | BasicProposal
  | SocialProposal
  | ApprovalProposal
  | OptimisticProposal;

// TODO: move this to a shared location
const parseTransaction = (t: ProposalDraftTransaction) => {
  const tenant = Tenant.current();
  if (isTransfer(t.calldata)) {
    const {
      args: [recipient, amount],
    } = decodeFunctionData({
      abi: transferABI,
      data: t.calldata as `0x${string}`,
    });

    return {
      target: t.target,
      value: t.value,
      calldata: t.calldata,
      type: TransactionType.TRANSFER,
      description: t.description,
      recipient,
      amount: formatUnits(amount, tenant.token.decimals),
      simulation_state: t.simulation_state,
      simulation_id: t.simulation_id,
    };
  } else {
    return {
      target: t.target,
      value: t.value,
      calldata: t.calldata,
      description: t.description,
      type: TransactionType.CUSTOM,
      simulation_state: t.simulation_state,
      simulation_id: t.simulation_id,
    };
  }
};
// Used to translate a draftProposal database record into its form representation
export const parseProposalToForm = (proposal: DraftProposal) => {
  switch (proposal.voting_module_type) {
    case ProposalType.BASIC:
      return {
        type: ProposalType.BASIC,
        title: proposal.title,
        abstract: proposal.abstract,
        transactions: proposal.transactions.map((t) => parseTransaction(t)),
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
        approvalProposal: {
          budget: proposal.budget,
          criteria: proposal.criteria,
          maxOptions: proposal.max_options?.toString(),
          threshold: proposal.threshold?.toString(),
          topChoices: proposal.top_choices?.toString(),
          options: proposal.approval_options?.map((option) => {
            return {
              title: option.title,
              transactions: option.transactions.map((t) => parseTransaction(t)),
            };
          }),
        },
      };
    case ProposalType.OPTIMISTIC:
      return {
        type: ProposalType.OPTIMISTIC,
        title: proposal.title,
        abstract: proposal.abstract,
      };
  }
};
