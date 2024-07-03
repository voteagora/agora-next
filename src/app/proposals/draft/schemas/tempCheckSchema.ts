import { z } from "zod";
import { isURL } from "@/lib/utils";

export const schema = z.object({
  temp_check_link: z
    .string()
    .trim()
    .refine((value) => isURL(value), {
      message: "Invalid URL.",
    })
    .optional(),
});
