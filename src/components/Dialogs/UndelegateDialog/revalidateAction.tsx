"use server";

import { revalidatePath } from "next/cache";

export async function revalidateData() {
  revalidatePath("/delegates");
}
