import { z } from "zod";
import { isAddress } from "viem";
import { ProposalType, TransactionType, SocialProposalType } from "../types";

const transaction = z.object({
  type: z.nativeEnum(TransactionType).optional(),
  target: z.string().refine((value) => isAddress(value), {
    message: "Target must be an address.",
  }),
  value: z.string().min(1),
  calldata: z.string().min(1, { message: "Calldata cannot be empty" }),
  description: z.string().min(1, { message: "Description cannot be empty" }),
  simulation_state: z.string(), // unconfirmed, valid, invalid
  simulation_id: z.string().nullable(),
  // part of transfer transaction -- gets filtered out of form
  recipient: z
    .string()
    .refine((value) => isAddress(value), {
      message: "Recipient must be an address.",
    })
    .optional(),
  // part of transfer transaction -- gets filtered out of form
  amount: z.string().min(1, { message: "Amount cannot be empty" }).optional(),
});

const socialOption = z.object({
  text: z.string().min(1, { message: "Option text cannot be empty" }),
});

const socialProposal = z
  .object({
    type: z.nativeEnum(SocialProposalType),
    start_date: z.coerce.date().optional(),
    end_date: z.coerce.date().optional(),
    options: z.array(socialOption),
  })
  .refine(
    (data) =>
      !data.end_date || !data.start_date || data.end_date > data.start_date,
    {
      message: "End date cannot be earlier than start date.",
      path: ["end_date"],
    }
  );

export const schema = z.object({
  type: z.nativeEnum(ProposalType),
  title: z.string().min(1, { message: "Title cannot be empty" }),
  abstract: z.string().min(1, { message: "Abstract cannot be empty" }),
  transactions: z.array(transaction),
  socialProposal: socialProposal.optional(),
});
