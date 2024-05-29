import { z } from "zod";

export const schema = z.object({
  snapshot_link: z
    .string()
    .min(1, { message: "Snapshot link cannot be empty" })
    .optional(),
  onchain_transaction_hash: z
    .string()
    .min(1, { message: "TxHash cannot be empty" })
    .optional(),
});
