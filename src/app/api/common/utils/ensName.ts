import { ensNameToAddress } from "@/app/lib/ENSUtils";
import { isAddress } from "viem";

export async function addressOrEnsNameWrap<T, P>(
  handler: (args: T & { address: string }) => Promise<P>,
  addressOrENSName: string,
  args: T = {} as T
) {
  const address = isAddress(addressOrENSName)
    ? addressOrENSName.toLowerCase()
    : await ensNameToAddress(addressOrENSName);

  return await handler({ ...args, address });
}
