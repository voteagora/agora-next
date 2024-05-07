import { ParsedProposalData } from "@/lib/proposalUtils";
import { ProposalType as PrismaProposalType } from "@prisma/client";

export enum ProposalLifecycleStage {
  TEMP_CHECK = "Temp Check",
  DRAFT = "Draft",
  READY = "Ready",
}

export const ProposalLifecycleStageMetadata = {
  [ProposalLifecycleStage.TEMP_CHECK]: {
    title: "Create temp check",
    description: "Check the temperature of the proposal",
    order: 1,
  },
  [ProposalLifecycleStage.DRAFT]: {
    title: "Create draft",
    description: "Draft the proposal",
    order: 2,
  },
  [ProposalLifecycleStage.READY]: {
    title: "Submit draft",
    description: "Ready to submit the proposal",
    order: 3,
  },
} as {
  [key in ProposalLifecycleStage]: {
    title: string;
    description: string;
    order: number;
  };
};

export enum ProposalType {
  EXECUTABLE = "Executable",
  SOCIAL = "Social",
}

export enum TransactionType {
  TRANSFER = "TRANSFER",
  CUSTOM = "CUSTOM",
}

export type TempCheckFormInputs = {
  tempcheck_link: string;
};

export type TransactionFormData = {
  type: TransactionType;
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
