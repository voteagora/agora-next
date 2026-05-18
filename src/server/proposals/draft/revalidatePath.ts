import type { FormState } from "@/app/types";

// No-op in TanStack Start — Next.js revalidatePath has no equivalent.
// TanStack Router refetches data on navigation automatically.
export const invalidatePath = (_id: number | string): FormState => ({
  ok: true,
  message: "Success!",
});
