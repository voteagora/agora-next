import { z } from "zod";
import { isAddress } from "viem";
import {
  ProposalType,
  TransactionType,
  SocialProposalType,
  ApprovalProposalType,
  EthereumAddress,
} from "../types";

const ethereumAddressSchema = z
  .string()
  .refine((value): value is EthereumAddress => isAddress(value), {
    message: "Target must be a valid Ethereum address.",
  });

const transaction = z.object({
  type: z.nativeEnum(TransactionType).optional(),
  target: ethereumAddressSchema,
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

const approvalProposal = z.object({
  budget: z.string().min(1, { message: "Budget cannot be empty" }),
  criteria: z.nativeEnum(ApprovalProposalType),
  maxOptions: z
    .number()
    .int()
    .min(1, { message: "Max options must be at least 1" })
    .optional(),
  threshold: z.number().int().optional(),
  topChoices: z
    .number()
    .int()
    .min(1, { message: "Top choices must be at least 1" }),
  options: z.array(transaction),
});

const BaseProposalSchema = z.object({
  type: z.nativeEnum(ProposalType),
  title: z.string().min(1, { message: "Title cannot be empty" }),
  abstract: z.string().min(1, { message: "Abstract cannot be empty" }),
});

export const BasicProposalSchema = BaseProposalSchema.extend({
  type: z.literal(ProposalType.BASIC),
  transactions: z.array(transaction),
});

export const SocialProposalSchema = BaseProposalSchema.extend({
  type: z.literal(ProposalType.SOCIAL),
  socialProposal,
});

export const ApprovalProposalSchema = BaseProposalSchema.extend({
  type: z.literal(ProposalType.APPROVAL),
  approvalProposal,
});

export const OptimisticProposalSchema = BaseProposalSchema.extend({
  type: z.literal(ProposalType.OPTIMISTIC),
});

export const DraftProposalSchema = z.discriminatedUnion("type", [
  BasicProposalSchema,
  SocialProposalSchema,
  ApprovalProposalSchema,
  OptimisticProposalSchema,
]);
