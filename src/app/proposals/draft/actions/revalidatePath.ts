"use server";

import { revalidatePath } from "next/cache";

export type FormState = {
  ok: boolean;
  message: string;
};

export const invalidatePath = (id: number | string): FormState => {
  revalidatePath(`/proposals/draft/${id}`);
};
