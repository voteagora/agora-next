"use server";
import { schema as tempCheckSchema } from "../schemas/tempCheckSchema";
import prisma from "@/app/lib/prisma";

export type FormState = {
  message: string;
};

export async function onSubmitAction(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  const formData = Object.fromEntries(data);
  const parsed = tempCheckSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      message: "Invalid form data",
    };
  }

  // pretend to do something with promise sleep
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    message: `Temp check saved...`,
  };
}
