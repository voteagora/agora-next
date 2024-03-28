import {
  ProposalDraft,
  ProposalDraftOption,
  ProposalDraftTransaction,
} from "@prisma/client";

export type ProposalDraftWithTransactions = ProposalDraft & {
  transactions: ProposalDraftTransaction[];
  ProposalDraftOption: ProposalDraftOption[];
};
