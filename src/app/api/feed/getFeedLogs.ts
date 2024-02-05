import "server-only";

import { Prisma } from "@prisma/client";
import prisma from "@/app/lib/prisma";

export async function getFeedLogs({
    page = 1,
    sort = "weighted_random",
    seed = Math.random(),
}: {
    page?: number;
    sort?: string;
    seed?: number;
}) {
    console.log("hola");
    const pageSize = 20;
    // TODO: frh -> this type and see if address or rest of params is needed
    // TODO: frh -> make sure there are only two subdelegations
    return await prisma.$queryRaw<Prisma.DelegatesGetPayload<true>[]>(
        Prisma.sql`
        SELECT *
        FROM (
            SELECT address, sighash, block_number, block_hash, transaction_hash, inputs
            FROM center.optimism_delegate_changed_events
            UNION ALL
            SELECT address, sighash, block_number, block_hash, transaction_hash, inputs
            FROM center.optimism_delegate_votes_changed_events
            UNION ALL
            SELECT address, sighash, block_number, block_hash, transaction_hash, inputs
            FROM center.optimism_proposal_created_0xc8df7ff2_events
            UNION ALL
            SELECT address, sighash, block_number, block_hash, transaction_hash, inputs
            FROM center.optimism_proposal_created_0x505ee268_events
            UNION ALL
            SELECT address, sighash, block_number, block_hash, transaction_hash, inputs
            FROM center.optimism_proposal_created_0x7d84a626_events
            UNION ALL
            SELECT address, sighash, block_number, block_hash, transaction_hash, inputs
            FROM center.optimism_proposal_created_0xe1a17f47_events
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
        LIMIT 10;        
      `
    );
}


