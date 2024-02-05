import "server-only";

import { Prisma } from "@prisma/client";
import prisma from "@/app/lib/prisma";

type Log = {
    address: string;
    sighash: string,
    block_number: bigint,
    block_hash: string
    transaction_hash: string,
    inputs: unknown
}

export async function getFeedLogs({
    page = 1,
    sort = "weighted_random",
    seed = Math.random(),
    event = 'all'
}: {
    page?: number;
    sort?: string;
    seed?: number;
    event: 'all' | 'delegations' | 'votes'
}) {
    console.log("hola");
    const pageSize = 20;
    // TODO: frh -> this type and see if address or rest of params is needed
    // TODO: frh -> make sure there are only two subdelegations
    switch (event) {
        case 'votes': return await prisma.$queryRaw<Log[]>(
            Prisma.sql
                `SELECT * FROM(
                    SELECT address, sighash, block_number, block_hash, transaction_hash, inputs
                    FROM center.optimism_vote_cast_events
                    UNION ALL
                    SELECT address, sighash, block_number, block_hash, transaction_hash, inputs
                    FROM center.optimism_alligator_vote_cast_events
                    UNION ALL
                    SELECT address, sighash, block_number, block_hash, transaction_hash, inputs
                    FROM center.optimism_alligator_votes_cast_events
                    UNION ALL
                    SELECT address, sighash, block_number, block_hash, transaction_hash, inputs
                    FROM center.optimism_vote_cast_with_params_events
                ) AS combined
                LIMIT 10;`
        );
        case 'delegations': return await prisma.$queryRaw<Log[]>(
            Prisma.sql
                `SELECT * FROM(
                    SELECT address, sighash, block_number, block_hash, transaction_hash, inputs
                    FROM center.optimism_delegate_changed_events
                    UNION ALL
                    SELECT address, sighash, block_number, block_hash, transaction_hash, inputs
                    FROM center.optimism_delegate_votes_changed_events
                    UNION ALL
                    SELECT address, sighash, block_number, block_hash, transaction_hash, inputs
                    FROM center.optimism_alligator_sub_delegations_0x26b34bfd_events
                    UNION ALL
                    SELECT address, sighash, block_number, block_hash, transaction_hash, inputs
                    FROM center.optimism_alligator_sub_delegation_events
                ) AS combined
                LIMIT 10;`
        );
        default: return await prisma.$queryRaw<Log[]>(
            Prisma.sql
                `SELECT * FROM(
                    SELECT address, sighash, block_number, block_hash, transaction_hash, inputs
                    FROM center.optimism_delegate_changed_events
                    UNION ALL
                    SELECT address, sighash, block_number, block_hash, transaction_hash, inputs
                    FROM center.optimism_delegate_votes_changed_events
                    UNION ALL
                    SELECT address, sighash, block_number, block_hash, transaction_hash, inputs
                    FROM center.optimism_vote_cast_events
                    UNION ALL
                    SELECT address, sighash, block_number, block_hash, transaction_hash, inputs
                    FROM center.optimism_alligator_vote_cast_events
                    UNION ALL
                    SELECT address, sighash, block_number, block_hash, transaction_hash, inputs
                    FROM center.optimism_alligator_votes_cast_events
                    UNION ALL
                    SELECT address, sighash, block_number, block_hash, transaction_hash, inputs
                    FROM center.optimism_vote_cast_with_params_events
                    UNION ALL
                    SELECT address, sighash, block_number, block_hash, transaction_hash, inputs
                    FROM center.optimism_alligator_sub_delegations_0x26b34bfd_events
                    UNION ALL
                    SELECT address, sighash, block_number, block_hash, transaction_hash, inputs
                    FROM center.optimism_alligator_sub_delegation_events
                ) AS combined
                LIMIT 10;`
        );
    }
}
