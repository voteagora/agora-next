import { z } from "zod";
import { ProposalType, TransactionType, SocialProposalType } from "../types";

const transaction = z.object({
  type: z.nativeEnum(TransactionType),
  target: z.string(),
  value: z.string(),
  calldata: z.string(),
  signature: z.string(),
  description: z.string(),
});

const socialOption = z.object({
  text: z.string(),
});

const socialProposal = z.object({
  type: z.nativeEnum(SocialProposalType),
  start_date: z.string(),
  end_date: z.string(),
  options: z.array(socialOption),
});

export const schema = z.object({
  type: z.nativeEnum(ProposalType),
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(1000),
  abstract: z.string().min(1).max(1000),
  transactions: z.array(transaction),
  docs_updated: z.boolean(),
  socialProposal: socialProposal.optional(),
});
