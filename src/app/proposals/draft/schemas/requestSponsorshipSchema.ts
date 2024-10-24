import { z } from "zod";
import { isAddress } from "viem";
import { DraftProposal } from "../types";

export const schema = z.object({
  is_public: z.boolean(),
  sponsors: z.array(
    z.object({
      address: z
        .string()
        .trim()
        .refine((value) => isAddress(value), {
          message: "Invalid address in sponsor list.",
        }),
    })
  ),
});

export const parseToForm = (draftProposal: DraftProposal) => {
  return {
    is_public: draftProposal.is_public,
    visibility: draftProposal.is_public ? "Public" : "Private",
    sponsors: draftProposal.approved_sponsors?.map((sponsor) => ({
      address: sponsor.sponsor_address as `0x${string}`,
    })),
  };
};

export const DEFAULT_FORM = {
  is_public: false,
  sponsors: [{ address: "" }],
};
