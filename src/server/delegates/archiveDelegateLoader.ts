"use server";

import { PaginatedResult } from "@/app/lib/pagination";
import { Vote } from "@/app/api/common/votes/vote";
import { parseVote } from "@/lib/voteUtils";
import { parseProposalData } from "@/lib/proposalUtils";
import { Block } from "ethers";
import Tenant from "@/lib/tenant/tenant";
import { prismaWeb3Client } from "@/app/lib/prisma";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { withMetrics } from "@/lib/metricWrapper";
import { unstable_cache } from "next/cache";

import { fetchProposalsFromArchive } from "@/lib/archiveUtils";
import { normalizeArchiveProposal } from "@/components/Proposals/Proposal/Archive/normalizeArchiveProposal";

/**
 * Archive-backed delegate vote loader that:
 * 1. Fetches proposals from GCS archive
 * 2. Fetches delegate votes from DB (EAS-backed)
 * 3. Joins them in memory on proposalId
 * 4. Returns unified data shape identical to existing delegate page
 */
export async function fetchVotesForDelegateFromArchive(
  addressOrENSName: string,
  pagination: { offset: number; limit: number } = { offset: 0, limit: 20 }
): Promise<PaginatedResult<Vote[]>> {
  return withMetrics("fetchVotesForDelegateFromArchive", async () => {
    const { namespace, contracts, ui, token } = Tenant.current();

    // Step 1: Fetch delegate votes from DB
    const delegateVotes = await fetchDelegateVotesFromDB(
      addressOrENSName,
      pagination
    );

    if (!delegateVotes || delegateVotes.length === 0) {
      return {
        meta: { has_next: false, total_returned: 0, next_offset: 0 },
        data: [],
      };
    }

    // Step 2: Fetch all proposals from archive using tenant namespace
    const archiveProposals = await fetchProposalsFromArchive(
      namespace,
      "everything",
      { limit: 10000, offset: 0 }
    );

    // Step 3: Create proposal lookup map for efficient joining
    const proposalMap = new Map<string, any>();
    archiveProposals.data.forEach((proposal) => {
      const normalizedProposal = normalizeArchiveProposal(proposal, {
        namespace,
        tokenDecimals: token?.decimals ?? 18,
      });
      proposalMap.set(proposal.id, normalizedProposal);
    });

    // Step 4: Join votes with proposals, providing fallbacks for missing proposals
    const latestBlock = ui.toggle("use-l1-block-number")?.enabled
      ? await contracts.providerForTime?.getBlock("latest")
      : await contracts.token.provider.getBlock("latest");

    const joinedVotes = await Promise.all(
      delegateVotes.map(async (vote) => {
        const proposalId = vote.proposal_id;
        const archiveProposal = proposalMap.get(proposalId);

        if (archiveProposal) {
          // Use archive proposal data
          const proposalData = parseProposalData(
            JSON.stringify({
              id: archiveProposal.id,
              title: archiveProposal.title,
              description: archiveProposal.title,
              proposer: archiveProposal.proposerAddress,
              startBlock: 0,
              endBlock: 0,
              status: archiveProposal.statusLabel,
              calldatas: [], // Archive doesn't have calldata
              targets: [], // Archive doesn't have targets
              values: [], // Archive doesn't have values
            }),
            "STANDARD"
          );

          return parseVote(vote, proposalData, latestBlock);
        } else {
          // Create fallback proposal for missing archive data
          const fallbackProposalData = parseProposalData(
            JSON.stringify({
              id: proposalId,
              title: `Unknown proposal #${proposalId}`,
              description: `Proposal ${proposalId} not found in archive`,
              proposer: "0x0000000000000000000000000000000000000000",
              startBlock: 0,
              endBlock: 0,
              status: "Unknown",
              calldatas: [],
              targets: [],
              values: [],
            }),
            "STANDARD"
          );

          return parseVote(vote, fallbackProposalData, latestBlock);
        }
      })
    );

    // Step 5: Calculate participation rate when archive feature is enabled
    let participationRate = 0;
    if (process.env.USE_CPLS_ARCHIVE_PROPOSALS === "true") {
      const totalProposals = archiveProposals.data.length;
      const distinctVotedProposals = new Set(
        delegateVotes.map((vote) => vote.proposal_id)
      ).size;

      participationRate =
        totalProposals > 0
          ? (distinctVotedProposals / totalProposals) * 100
          : 0;
    }

    // Step 6: Apply pagination to the joined results
    const start = pagination.offset;
    const end = start + pagination.limit;
    const paginatedVotes = joinedVotes.slice(start, end);

    return {
      meta: {
        has_next: end < joinedVotes.length,
        total_returned: paginatedVotes.length,
        next_offset: end,
        participationRate, // Add participation rate to meta
      },
      data: paginatedVotes,
    };
  });
}

/**
 * Fetch delegate votes from database (reusing existing logic from getVotes.ts)
 * This is the same query used by the existing delegate vote loading
 */
async function fetchDelegateVotesFromDB(
  addressOrENSName: string,
  pagination: { offset: number; limit: number }
): Promise<any[]> {
  const { namespace, contracts } = Tenant.current();

  let eventsViewName;
  if (namespace === TENANT_NAMESPACES.OPTIMISM) {
    eventsViewName = "vote_cast_with_params_events_v2";
  } else {
    eventsViewName = "vote_cast_with_params_events";
  }

  const query = `
    SELECT
      transaction_hash,
      proposal_id,
      voter,
      support,
      weight,
      reason,
      block_number,
      params,
      description,
      proposal_data,
      proposal_type
    FROM (
      SELECT * FROM (
      SELECT
        STRING_AGG(transaction_hash,'|') as transaction_hash,
        proposal_id,
        voter,
        support,
        SUM(weight) as weight,
        STRING_AGG(distinct reason, '\n --------- \n') as reason,
        MAX(block_number) as block_number,
        params
      FROM (
        SELECT
            transaction_hash,
            proposal_id,
            voter,
            support,
            weight::numeric,
            reason,
            block_number,
            params
          FROM ${namespace}.vote_cast_events
          WHERE voter = $1 AND contract = $2
        UNION ALL
          SELECT
            transaction_hash,
            proposal_id,
            voter,
            support,
            weight::numeric,
            reason,
            block_number,
            params
          FROM ${namespace}.${eventsViewName}
          WHERE voter = $1 AND contract = $2
      ) t
      GROUP BY 2,3,4,8
      ) av
      LEFT JOIN LATERAL (
        SELECT
          proposals.description,
          proposals.proposal_data,
          proposals.proposal_type::config.proposal_type AS proposal_type
        FROM
          ${namespace}.proposals_v2 proposals
        WHERE
          proposals.proposal_id = av.proposal_id AND proposals.contract = $2) p ON TRUE
    ) q
    ORDER BY block_number DESC
    OFFSET $3
    LIMIT $4;
  `;

  return prismaWeb3Client.$queryRawUnsafe<any[]>(
    query,
    addressOrENSName.toLowerCase(),
    contracts.governor.address.toLowerCase(),
    pagination.offset,
    pagination.limit
  );
}

/**
 * Cached version of the archive delegate loader
 * Uses the same caching strategy as the existing delegate vote loading
 */
export const fetchVotesForDelegateFromArchiveCached = unstable_cache(
  fetchVotesForDelegateFromArchive,
  ["archiveDelegateVotes"],
  {
    revalidate: 60, // 1 minute cache
    tags: ["archiveDelegateVotes"],
  }
);
