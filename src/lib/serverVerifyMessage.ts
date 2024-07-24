import "server-only";

import { createPublicClient, http } from "viem";
import Tenant from "@/lib/tenant/tenant";

export default async function verifyMessage({
  address,
  message,
  signature,
}: {
  address: `0x${string}`;
  signature: `0x${string}`;
  message: string;
}) {
  const { contracts } = Tenant.current();
  const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID!;
  const hasAlchemy = contracts.token.chain.rpcUrls?.alchemy;

  const transport = hasAlchemy
    ? `${contracts.token.chain.rpcUrls.alchemy.http[0]}/${alchemyId}`
    : `${contracts.token.chain.rpcUrls.default.http[0]}`;

  const publicClient = createPublicClient({
    chain: contracts.token.chain,
    transport: http(transport),
  });

  return await publicClient.verifyMessage({
    address,
    message,
    signature,
  });
}
