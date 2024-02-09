import { ethProvider } from "@/app/lib/provider";
import { isAddress } from "viem";
import { truncateAddress } from "@/app/lib/utils/text";

export async function resolveENSName(name: string) {
  const address = await ethProvider.resolveName(name);
  if (!address) {
    throw new Error("No address found for ENS name");
  }

  return address.toLowerCase();
}

export async function reverseResolveENSName(
  address: string
): Promise<string | null> {
  try {
    const ensName = await ethProvider.lookupAddress(address);

    return ensName || null;
  } catch (error) {
    console.error("ENS Resolution Error", error);
    return null;
  }
}

export async function processAddressOrEnsName(addressOrENSName: string) {
  if (isAddress(addressOrENSName)) {
    const ensName = await reverseResolveENSName(addressOrENSName.toLowerCase());
    if (ensName) {
      return ensName;
    } else {
      return truncateAddress(addressOrENSName);
    }
  } else {
    try {
      const address = await resolveENSName(addressOrENSName);
      if (address) {
        return addressOrENSName;
      } else {
        return "";
      }
    } catch (error) {
      console.error("Error resolving ENS name:", error);
      return null;
    }
  }
}
