"use server";

import { revalidatePath } from "next/cache";

export type FormState = {
  ok: boolean;
  message: string;
};

export const invalidatePath = async (id: number | string) => {
  "use server";
  const { revalidatePath } = await import("next/cache");
  revalidatePath(`/proposals/draft/${id}`);
};
