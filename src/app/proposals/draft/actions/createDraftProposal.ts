"use server";
import { schema as DraftProposalSchema } from "../schemas/DraftProposalSchema";
import prisma from "@/app/lib/prisma";

export type FormState = {
  message: string;
};

export async function onSubmitAction(data: any): Promise<FormState> {
  const parsed = DraftProposalSchema.safeParse(data);
  if (!parsed.success) {
    return {
      message: "Invalid form data",
    };
  }
  console.log(data);

  return {
    message: "Success!",
  };
}
