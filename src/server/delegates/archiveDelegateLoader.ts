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
      const distinctVotedProposals =
        await fetchDistinctVotedProposals(addressOrENSName);

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
 * Fetch distinct proposal IDs that a delegate has voted on
 * Used for participation rate calculation - lightweight query
 * Uses votes table to include EAS votes
 */
async function fetchDistinctVotedProposals(
  addressOrENSName: string
): Promise<number> {
  const { namespace, contracts } = Tenant.current();

  const query = `
    SELECT COUNT(DISTINCT proposal_id) as count
    FROM ${namespace}.votes
    WHERE voter = $1 AND contract = $2;
  `;

  const result = await prismaWeb3Client.$queryRawUnsafe<[{ count: bigint }]>(
    query,
    addressOrENSName.toLowerCase(),
    contracts.governor.address.toLowerCase()
  );

  return Number(result[0]?.count || 0);
}

/**
 * Fetch delegate votes from database using votes table
 * Uses votes table to include EAS votes, not just on-chain events
 */
async function fetchDelegateVotesFromDB(
  addressOrENSName: string,
  pagination: { offset: number; limit: number }
): Promise<any[]> {
  const { namespace, contracts } = Tenant.current();

  const query = `
    SELECT DISTINCT proposal_id
    FROM ${namespace}.votes
    WHERE voter = $1 AND contract = $2
    ORDER BY proposal_id DESC
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
