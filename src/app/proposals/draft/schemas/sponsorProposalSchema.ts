import { z } from "zod";
import { ProposalScope } from "../types";

export const schema = z.object({
  snapshot_link: z
    .string()
    .min(1, { message: "Snapshot link cannot be empty" })
    .optional(),
  onchain_transaction_hash: z
    .string()
    .min(1, { message: "TxHash cannot be empty" })
    .optional(),
  proposal_scope: z.nativeEnum(ProposalScope).optional(),
  is_offchain_submission: z.boolean().optional(),
});
