import "server-only";

import { createPublicClient, http } from 'viem'
import { mainnet, optimism } from "viem/chains";
import { type DaoSlug } from "@prisma/client";


export default async function verifyMessage({ address, message, signature, daoSlug }: {
    address: `0x${string}`,
    signature: `0x${string}`,
    message: string,
    daoSlug: DaoSlug
}) {
    // Alchemy key
    const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID!;

    const publicClient = createPublicClient({
        chain: daoSlug === 'OP' ? optimism : mainnet,
        transport: http(daoSlug === 'OP' ? `https://opt-mainnet.g.alchemy.com/v2/${alchemyId}` : `https://eth-goerli.g.alchemy.com/v2/${alchemyId}`)
    });

    return await publicClient.verifyMessage({
        address,
        message,
        signature
    });
}