"use server";

import { revalidatePath } from "next/cache";

export type FormState = {
  ok: boolean;
  message: string;
};

export const invalidatePath = (id: number): FormState => {
  revalidatePath(`/proposals/draft/${id}`);

  return {
    ok: true,
    message: "Success!",
  };
};
