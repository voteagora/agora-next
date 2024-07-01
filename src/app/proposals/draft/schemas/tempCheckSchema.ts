import { z } from "zod";

const isURL = (value: string) => {
  // Regular expression for URL validation
  const urlRegExp = /^(?:(?:https?|ftp):\/\/)?[\w/\-?=%.]+\.[\w/\-?=%.]+$/i;
  return value === "" || urlRegExp.test(value);
};

export const schema = z.object({
  temp_check_link: z
    .string()
    .trim()
    .refine((value) => isURL(value), {
      message: "Invalid URL.",
    })
    .optional(),
});
