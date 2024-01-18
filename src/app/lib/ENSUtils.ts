import { ethProvider } from "@/app/lib/provider";

export async function resolveENSName(name: string) {
  const address = await ethProvider.resolveName(name);
  if (!address) {
    throw new Error("No address found for ENS name");
  }

  return address.toLowerCase();
}
