import { z } from "zod";
import { isAddress } from "viem";
import { DraftProposal, Visibility } from "../types";

export const schema = z
  .object({
    visibility: z.nativeEnum(Visibility),
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
  })
  .refine((data) => data.visibility === "Public" || data.sponsors.length > 0, {
    message: "Please make this proposal public or add at least one sponsor.",
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
  sponsors: [],
};
