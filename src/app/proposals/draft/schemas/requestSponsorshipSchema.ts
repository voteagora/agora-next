import { z } from "zod";
import { isAddress } from "viem";

export const schema = z.object({
  sponsor_address: z
    .string()
    .trim()
    .refine((value) => isAddress(value), {
      message: "Invalid address.",
    }),
});
