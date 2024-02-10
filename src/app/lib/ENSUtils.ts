import { ethProvider } from "@/app/lib/provider";
import { truncateAddress } from "@/app/lib/utils/text";

export const isENSName = (name: string) => name.endsWith(".eth");

export async function resolveENSName(name: string) {
  const address = await ethProvider.resolveName(name);
  if (!address) {
    throw new Error("No address found for ENS name");
  }

  return address.toLowerCase();
}

export async function reverseResolveENSName(address: string): Promise<string | null> {
  try {
    const ensName = await ethProvider.lookupAddress(address);

    return ensName || null;
  } catch (error) {
    console.error("ENS Resolution Error", error);
    return null;
  }
}


export async function resolveENSProfileImage(address: string): Promise<string | null> {

  const lowerCaseAddress = address.toLowerCase();

  // Only resolve ENS names
  if (!isENSName(lowerCaseAddress)) {
    return null;
  }
  try {
    return await ethProvider.getAvatar(lowerCaseAddress);
  } catch (error) {
    console.error("ENS Avatar error", error);
    return null;
  }
}

export async function processAddressOrEnsName(addressOrENSName: string) {

  if (isENSName(addressOrENSName)) {
    return addressOrENSName;
  }

  try {
    return await reverseResolveENSName(addressOrENSName) || truncateAddress(addressOrENSName);
  } catch (error) {
    console.error("Error in reverse resolving ENS name:", error);
    return null;
  }
}
