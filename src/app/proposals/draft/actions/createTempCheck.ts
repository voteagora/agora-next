"use server";

import { z } from "zod";
import { schema as tempCheckSchema } from "../schemas/tempCheckSchema";
import prisma from "@/app/lib/prisma";

export type FormState = {
  ok: boolean;
  message: string;
};

export async function onSubmitAction(
  data: z.output<typeof tempCheckSchema> & { dao_slug: string }
): Promise<FormState> {
  const parsed = tempCheckSchema.safeParse(data);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Invalid form data",
    };
  }

  const EMPTY_PROPOSAL_DEFAULTS = {
    title: "",
    description: "",
    abstract: "",
    author_address: "",
    proposal_type: "",
  };

  try {
    await prisma.proposalDraft.create({
      data: {
        ...EMPTY_PROPOSAL_DEFAULTS,
        temp_check_link: parsed.data.temp_check_link || "",
        dao_slug: "", // TODO: this should come from the form
      },
    });

    return {
      ok: true,
      message: `Temp check saved.`,
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      message: "Error saving temp check",
    };
  }
}
