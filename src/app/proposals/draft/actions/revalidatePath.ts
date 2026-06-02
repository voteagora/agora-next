"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/app/types";

export const invalidatePath = async (
  id: number | string
): Promise<FormState> => {
  revalidatePath(`/proposals/draft/${id}`);
  return { ok: true, message: "Success!" };
};
