import { z } from "zod";
import { isAddress } from "viem";
import { ProposalType, TransactionType, SocialProposalType } from "../types";

const transaction = z.object({
  type: z.nativeEnum(TransactionType),
  target: z.string().refine((value) => isAddress(value), {
    message: "Not an address.",
  }),
  value: z.string().min(1),
  calldata: z.string().min(1).max(255),
  description: z.string().min(1).max(255),
  // hidden input so needs to be string, but use true false, really a boolean
  // TODO: maybe an enum to make sure its only true or false?
  isValid: z.string(),
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
