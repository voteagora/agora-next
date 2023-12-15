import { resolveENSName } from "@/app/lib/utils";
import { isAddress } from "viem";

export async function addressOrEnsNameWrap<T, P>(
  handler: (args: T & { address: string }) => Promise<P>,
  addressOrENSName: string,
  args: T = {} as T
) {
  const address = isAddress(addressOrENSName)
    ? addressOrENSName.toLowerCase()
    : await resolveENSName(addressOrENSName);

  return await handler({ ...args, address });
}
