import { z } from "zod";
import { isAddress } from "viem";
import {
  ProposalType,
  TransactionType,
  SocialProposalType,
  ApprovalProposalType,
  EthereumAddress,
  ProposalScope,
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
  calldata: z
    .string()
    .min(1, { message: "Calldata cannot be empty" })
    .regex(/^0x([0-9a-fA-F]{2})*$/, {
      message:
        "Calldata must be a valid hex string starting with 0x and have an even number of characters",
    }),
  signature: z.string().optional(),
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
  // part of transfer transaction -- gets filtered out of form
  customTokenAddress: z
    .string()
    .refine((value) => !value || isAddress(value), {
      message: "Custom token address must be a valid Ethereum address.",
    })
    .optional(),
});

const approval_option = z.object({
  title: z.string().min(1, { message: "Title cannot be empty" }),
  transactions: z.array(transaction),
});

const socialOption = z.object({
  text: z.string().min(1, { message: "Option text cannot be empty" }),
});

const socialProposal = z
  .object({
    type: z.nativeEnum(SocialProposalType),
    start_date: z.coerce.date().min(new Date(), {
      message: "Start date is required and must be in the future",
    }),
    end_date: z.coerce.date().min(new Date(), {
      message: "End date is required and must be in the future",
    }),
    options: z.array(socialOption),
  })
  .refine((data) => data.end_date > data.start_date, {
    message: "End date cannot be earlier than start date.",
    path: ["end_date"],
  });

const approvalProposal = z
  .object({
    criteria: z.nativeEnum(ApprovalProposalType),
    budget: z.string().optional(),
    maxOptions: z.string().optional(),
    threshold: z.string().optional(),
    topChoices: z
      .string()
      .min(1, { message: "Top choices must be at least 1" })
      .optional(),
    options: z.array(approval_option),
  })
  .refine(
    (data) => {
      if (data.topChoices !== undefined) {
        const topChoices = parseInt(data.topChoices);
        return !isNaN(topChoices) && topChoices <= data.options.length;
      }

      return true;
    },
    {
      message:
        "Top choices must be less than or equal to the number of options",
      path: ["topChoices"],
    }
  )
  .refine(
    (data) => {
      if (data.maxOptions !== undefined) {
        const maxOptions = parseInt(data.maxOptions);
        return !isNaN(maxOptions) && maxOptions <= data.options.length;
      }

      return true;
    },
    {
      message:
        "Max options must be less than or equal to the number of options",
      path: ["maxOptions"],
    }
  )
  .refine(
    (data) => {
      if (data.criteria === ApprovalProposalType.THRESHOLD) {
        if (data.threshold === undefined) {
          return false;
        }
        const threshold = parseInt(data.threshold);
        return !isNaN(threshold);
      }

      return true;
    },
    {
      message: "Threshold must be be a positive number",
      path: ["threshold"],
    }
  );

const BaseProposalSchema = z.object({
  type: z.nativeEnum(ProposalType),
  proposalConfigType: z.string().optional(),
  title: z.string().min(1, { message: "Title cannot be empty" }),
  abstract: z.string().min(1, { message: "Description cannot be empty" }),
  simulation_state: z.string().optional(), // unconfirmed, valid, invalid
  simulation_id: z.string().optional(),
  proposal_scope: z.nativeEnum(ProposalScope).optional(),
  tiers_enabled: z.boolean().optional(),
  tiers: z.array(z.number()).optional(),
  calculationOptions: z.number().optional(),
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

export const OptimisticExecutableProposalSchema = BaseProposalSchema.extend({
  type: z.literal(ProposalType.OPTMISTIC_EXECUTABLE),
});

export const DraftProposalSchema = z.discriminatedUnion("type", [
  BasicProposalSchema,
  SocialProposalSchema,
  ApprovalProposalSchema,
  OptimisticProposalSchema,
  OptimisticExecutableProposalSchema,
]);
