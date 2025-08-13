import "server-only";

import { getPublicClient } from "./viem";

export default async function verifyMessage({
  address,
  message,
  signature,
}: {
  address: `0x${string}`;
  signature: `0x${string}`;
  message: string;
}) {
  const publicClient = getPublicClient();
  return await publicClient.verifyMessage({
    address,
    message,
    signature,
  });
}
