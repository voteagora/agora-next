import { ProposalDraft, ProposalDraftTransaction } from "@prisma/client";

export type ProposalDraftWithTransactions = ProposalDraft & {
  transactions: ProposalDraftTransaction[];
};
