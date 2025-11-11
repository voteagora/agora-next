import { truncateAddress } from "@/app/lib/utils/text";
import { isAddress } from "viem";
import { AlchemyProvider } from "ethers";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { createLoggingProvider } from "@/lib/debug/providerLogger";

const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID;
const mainnetProvider = createLoggingProvider(
  new AlchemyProvider("mainnet", alchemyId),
  "ENS-Mainnet"
) as AlchemyProvider;

export const ensNameToAddress = unstable_cache(
  async (nameOrAddress) => {
    if (isAddress(nameOrAddress)) {
      return nameOrAddress;
    }

    const address = await mainnetProvider.resolveName(nameOrAddress);

    if (!address) {
      throw new Error("No address found for ENS name");
    }

    return address.toLowerCase();
  },
  [],
  {
    revalidate: 3600, // 1 hour cache
  }
);

// Only used in OP delegation modal  - use ensNameToAddress instead
export async function resolveENSName(nameOrAddress: string) {
  if (isAddress(nameOrAddress)) {
    return nameOrAddress;
  }

  const address = await cache((name: string) =>
    mainnetProvider.resolveName(name)
  )(nameOrAddress);

  if (!address) {
    throw new Error("No address found for ENS name");
  }

  return address.toLowerCase();
}

export async function reverseResolveENSName(
  address: string
): Promise<string | null> {
  try {
    const ensName = await mainnetProvider.lookupAddress(address);

    return ensName || null;
  } catch (error) {
    console.error("ENS Resolution Error", error);
    return null;
  }
}

export async function resolveENSProfileImage(
  address: string
): Promise<string | null> {
  const lowerCaseAddress = address.toLowerCase();

  // Return unless the address is a valid ENS name.
  // Basic detection for strings that start with 0x
  const pattern = /^0x[a-fA-F0-9]+/;
  if (pattern.test(address)) {
    return null;
  }

  try {
    return await mainnetProvider.getAvatar(lowerCaseAddress);
  } catch (error) {
    console.error("ENS Avatar error", error);
    return null;
  }
}

/*
  Returns the ENS name for the address if it exists, otherwise truncates address
*/
export async function processAddressOrEnsName(addressOrENSName: string) {
  // Assume resolved ens name
  if (!isAddress(addressOrENSName)) {
    return addressOrENSName;
  }

  try {
    return (
      (await reverseResolveENSName(addressOrENSName)) ||
      truncateAddress(addressOrENSName)
    );
  } catch (error) {
    console.error("Error in reverse resolving ENS name:", error);
    return null;
  }
}

/*
  Returns the ENS text record for the addressOrENSName if it exists, otherwise returns null
*/
export const resolveENSTextRecords: (
  addressOrENSName: string,
  keys: string[]
) => Promise<Record<string, string> | null> = unstable_cache(
  async (addressOrENSName: string, keys: string[]) => {
    try {
      let name;
      if (isAddress(addressOrENSName)) {
        name = await reverseResolveENSName(addressOrENSName);
      } else {
        name = addressOrENSName;
      }

      if (!name) {
        return null;
      }

      const resolver = await mainnetProvider.getResolver(name);

      if (!resolver) {
        return null;
      }

      const textRecords: Record<string, string> = {};

      for (const key of keys) {
        try {
          const value = await resolver.getText(key);
          if (value !== null) {
            textRecords[key] = value;
          }
        } catch (error) {
          console.error(`Error fetching ${key} text record:`, error);
          // Skip failed records and continue with others
          continue;
        }
      }

      return textRecords;
    } catch (error) {
      console.error("Error in resolving ENS text records:", error);
      return null;
    }
  },
  [],
  {
    revalidate: 86400, // 1 day
    tags: ["resolveENSTextRecords"],
  }
);

/*
  Returns the EFP stats for the addressOrENSName if it exists
*/
export const resolveEFPStats = unstable_cache(
  async (addressOrENSName: string) => {
    try {
      const response = await fetch(
        `https://api.ethfollow.xyz/api/v1/users/${addressOrENSName}/stats`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error in resolving EFP stats:", error);
      return null;
    }
  },
  ["resolveEFPStats"],
  { revalidate: 86400 } // 1 day
);
