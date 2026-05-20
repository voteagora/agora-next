import { revalidatePath } from "@/lib/shims/next-cache";

export async function revalidateData() {
  revalidatePath("/delegates");
}
