"use server";

import { revalidatePath } from "@/lib/shims/next-cache";
import type { FormState } from "@/app/types";

export const invalidatePath = (id: number | string): FormState => {
  revalidatePath(`/proposals/draft/${id}`);
  return { ok: true, message: "Success!" };
};
