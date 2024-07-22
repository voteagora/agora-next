import {
  paginateResultEx,
  type PaginatedResultEx,
  type PaginationParamsEx,
} from "@/app/lib/pagination";
import prisma from "@/app/lib/prisma";
import { cache } from "react";
import { isAddress } from "viem";
import { resolveENSName } from "@/app/lib/ENSUtils";
import {
  DelegateChunk,
  type Delegate,
  type DelegatesGetPayload,
  type DelegateStats,
} from "./delegate";
import Tenant from "@/lib/tenant/tenant";
import { fetchCurrentQuorum } from "@/app/api/common/quorum/getQuorum";
import { fetchVotableSupply } from "@/app/api/common/votableSupply/getVotableSupply";
import { doInSpan } from "@/app/lib/logging";

/*
 * Fetches a list of delegates
 * @param page - the page number to fetch
 * @param sort - the sort order
 * @param seed - the seed for random sorting
 * @returns - a list of delegates
 */
async function getDelegates({
  pagination = {
    limit: 20,
    offset: 0,
  },
  sort,
  seed,
  filters,
}: {
  pagination: PaginationParamsEx;
  sort: string;
  seed?: number;
  filters?: {
    issues?: string;
    stakeholders?: string;
    endorsed?: boolean;
  };
}): Promise<PaginatedResultEx<DelegateChunk[]>> {
  const { namespace, ui, slug, contracts } = Tenant.current();

  const allowList = ui.delegates?.allowed || [];

  const endorsedFilterQuery = filters?.endorsed ? `AND endorsed = true` : "";

  const topIssuesParam = filters?.issues || "";
  const topIssuesFilterQuery =
    topIssuesParam && topIssuesParam !== ""
      ? `
      AND jsonb_array_length(s.payload -> 'topIssues') > 0
      AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements(s.payload -> 'topIssues') elem
        WHERE elem ->> 'type' = '${topIssuesParam}'
        AND elem ->> 'value' IS NOT NULL
        AND elem ->> 'value' <> ''
      )
      AND s.dao_slug = '${slug}'
    `
      : "";

  // Note: There is an inconsistency between top stakeholders and top issues. Top issues are filtered by a value
  // where the top stakeholders are filtered on type. We need to make this consistent and clean up the data and UI.
  const topStakeholdersParam = filters?.stakeholders || "";
  const topStakeholdersFilterQuery =
    topStakeholdersParam && topStakeholdersParam !== ""
      ? `
      AND jsonb_array_length(s.payload -> 'topStakeholders') > 0
      AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements(s.payload -> 'topStakeholders') elem
        WHERE elem ->> 'type' = '${topStakeholdersParam}'
      )
      AND s.dao_slug = '${slug}'
    `
      : "";

  // Applies allow-list filtering to the delegate list
  const paginatedAllowlistQuery = async (skip: number, take: number) => {
    switch (sort) {
      case "most_delegators":
        return prisma.$queryRawUnsafe<DelegatesGetPayload[]>(
          `
            SELECT *,
              CASE
                WHEN EXISTS (
                  SELECT 1
                  FROM agora.citizens
                  WHERE LOWER(address) = d.delegate AND dao_slug=$2::config.dao_slug
                ) THEN TRUE
                ELSE FALSE
              END AS citizen,
              (SELECT row_to_json(sub)
                FROM (
                  SELECT
                    signature,
                    payload,
                    twitter,
                    discord,
                    created_at,
                    updated_at,
                    warpcast, 
                    endorsed
                  FROM agora.delegate_statements s
                  WHERE s.address = d.delegate AND s.dao_slug = $2::config.dao_slug
                  ${endorsedFilterQuery}
                  ${topIssuesFilterQuery}
                  ${topStakeholdersFilterQuery}
                  LIMIT 1
                ) sub
              ) AS statement
            FROM ${namespace + ".delegates"} d
            WHERE num_of_delegators IS NOT NULL
            AND (ARRAY_LENGTH($1::text[], 1) IS NULL OR delegate = ANY($1::text[]))
            AND d.contract = $3
            AND EXISTS (
                SELECT 1
                FROM agora.delegate_statements s
                WHERE s.address = d.delegate
                ${endorsedFilterQuery}
                ${topIssuesFilterQuery}
                ${topStakeholdersFilterQuery}
            )
            ORDER BY num_of_delegators DESC
            OFFSET $4
            LIMIT $5;
            `,
          allowList,
          slug,
          contracts.token.address,
          skip,
          take
        );

      case "weighted_random":
        await prisma.$executeRawUnsafe(`SELECT setseed($1);`, seed);
        return prisma.$queryRawUnsafe<DelegatesGetPayload[]>(
          `
            SELECT *,
              CASE
                WHEN EXISTS (
                  SELECT 1
                  FROM agora.citizens
                  WHERE LOWER(address) = d.delegate AND dao_slug=$3::config.dao_slug
                ) THEN TRUE
                ELSE FALSE
              END AS citizen,
              (SELECT row_to_json(sub)
                FROM (
                  SELECT
                    signature,
                    payload,
                    twitter,
                    discord,
                    created_at,
                    updated_at,
                    warpcast,
                    endorsed
                  FROM agora.delegate_statements s
                  WHERE s.address = d.delegate AND s.dao_slug = $3::config.dao_slug
                  ${endorsedFilterQuery}
                  ${topIssuesFilterQuery}
                  ${topStakeholdersFilterQuery}
                  LIMIT 1
                ) sub
              ) AS statement
            FROM ${namespace + ".delegates"} d
            WHERE (ARRAY_LENGTH($2::text[], 1) IS NULL OR delegate = ANY($2::text[]))
            AND d.contract = $4
            AND EXISTS (
                SELECT 1
                FROM agora.delegate_statements s
                WHERE s.address = d.delegate
                ${endorsedFilterQuery}
                ${topIssuesFilterQuery}
                ${topStakeholdersFilterQuery}
            )
           ORDER BY -log(random()) / NULLIF(voting_power, 0)
            OFFSET $5
            LIMIT $6;
            `,
          seed,
          allowList,
          slug,
          contracts.token.address,
          skip,
          take
        );

      default:
        return prisma.$queryRawUnsafe<DelegatesGetPayload[]>(
          `
            SELECT *,
              CASE
                WHEN EXISTS (
                  SELECT 1
                  FROM agora.citizens
                  WHERE LOWER(address) = d.delegate AND dao_slug=$2::config.dao_slug
                ) THEN TRUE
                ELSE FALSE
              END AS citizen,
              (SELECT row_to_json(sub)
                FROM (
                  SELECT
                    signature,
                    payload,
                    twitter,
                    discord,
                    created_at,
                    updated_at,
                    warpcast,
                    endorsed
                  FROM agora.delegate_statements s
                  WHERE s.address = d.delegate AND s.dao_slug = $2::config.dao_slug
                  ${endorsedFilterQuery}
                  ${topIssuesFilterQuery}
                  ${topStakeholdersFilterQuery}
                  LIMIT 1
                ) sub
              ) AS statement
            FROM ${namespace + ".delegates"} d
            WHERE (ARRAY_LENGTH($1::text[], 1) IS NULL OR delegate = ANY($1::text[]))
            AND d.contract = $3
            AND EXISTS (
                SELECT 1
                FROM agora.delegate_statements s
                WHERE s.address = d.delegate
                ${endorsedFilterQuery}
                ${topIssuesFilterQuery}
                ${topStakeholdersFilterQuery}
            )
            ORDER BY voting_power DESC
            OFFSET $4
            LIMIT $5;
            `,
          allowList,
          slug,
          contracts.token.address,
          skip,
          take
        );
    }
  };

  const { meta, data: delegates } = await doInSpan(
    { name: "getDelegates" },
    async () =>
      await paginateResultEx<DelegatesGetPayload[]>(
        paginatedAllowlistQuery,
        pagination
      )
  );

  // Voting power detail added for use with API, so as to not break existing
  // components
  return {
    meta,
    data: delegates.map((delegate) => ({
      address: delegate.delegate,
      votingPower: {
        total: delegate.voting_power?.toFixed(0) || "0",
        direct: delegate.direct_vp?.toFixed(0) || "0",
        advanced: delegate.advanced_vp?.toFixed(0) || "0",
      },
      citizen: delegate.citizen,
      statement: delegate.statement,
    })),
    seed,
  };
}

async function getDelegate(addressOrENSName: string): Promise<Delegate> {
  const { namespace, contracts, slug } = Tenant.current();
  const address = isAddress(addressOrENSName)
    ? addressOrENSName.toLowerCase()
    : await resolveENSName(addressOrENSName);

  const delegateQuery = prisma.$queryRawUnsafe<DelegateStats[]>(
    `
    SELECT
      voter,
      proposals_voted,
      "for",
      "against",
      "abstain",
      participation_rate,
      last_10_props,
      voting_power,
      advanced_vp,
      num_of_delegators,
      proposals_proposed,
      citizen.citizen,
      statement.statement
    FROM
        (SELECT 1 as dummy) dummy_table
    LEFT JOIN
        (SELECT * FROM ${namespace + ".voter_stats"} WHERE voter = $1 AND contract = $4) a ON TRUE
    LEFT JOIN
      ${
        namespace + ".advanced_voting_power"
      } av ON av.delegate = $1 AND av.contract = $2
    LEFT JOIN
        (SELECT num_of_delegators FROM ${
          namespace + ".delegates"
        } nd WHERE delegate = $1 LIMIT 1) b ON TRUE
    LEFT JOIN
        (SELECT * FROM ${
          namespace + ".voting_power"
        } vp WHERE vp.delegate = $1 AND vp.contract = $5  LIMIT 1) c ON TRUE
    LEFT JOIN
        (SELECT
          CASE
          WHEN EXISTS (SELECT 1 FROM agora.citizens ac WHERE LOWER(ac.address) = LOWER($1) AND ac.dao_slug = $3::config.dao_slug) THEN TRUE
          ELSE FALSE
          END as citizen
        ) citizen ON TRUE
    LEFT JOIN
        (SELECT row_to_json(sub) as statement
        FROM (
          SELECT
            signature,
            payload,
            twitter,
            discord,
            created_at,
            updated_at,
            warpcast,
            endorsed
          FROM agora.delegate_statements s 
          WHERE s.address = LOWER($1) AND s.dao_slug = $3::config.dao_slug
          LIMIT 1
        ) sub
      ) AS statement ON TRUE;
    `,
    address,
    contracts.alligator?.address || "",
    slug,
    contracts.governor.address,
    contracts.token.address
  );

  const [delegate, votableSupply, quorum] = await Promise.all([
    delegateQuery.then((result) => result?.[0] || undefined),
    fetchVotableSupply(),
    fetchCurrentQuorum(),
  ]);

  const numOfDelegatesQuery = contracts.alligator
    ? prisma.$queryRawUnsafe<{ num_of_delegators: BigInt }[]>(
        `
        SELECT 
          SUM(count) as num_of_delegators
        FROM (
          SELECT count(*)
          FROM ${namespace + ".advanced_delegatees"}
          WHERE "to"=$1 AND contract=$2 AND delegated_amount > 0
          UNION ALL
          SELECT
            SUM((CASE WHEN to_delegate=$1 THEN 1 ELSE 0 END) - (CASE WHEN from_delegate=$1 THEN 1 ELSE 0 END)) as num_of_delegators
          FROM ${namespace + ".delegate_changed_events"}
          WHERE to_delegate=$1 OR from_delegate=$1
        ) t;
        `,
        address,
        contracts.alligator?.address
      )
    : prisma.$queryRawUnsafe<{ num_of_delegators: BigInt }[]>(
        `
        SELECT
          SUM((CASE WHEN to_delegate=$1 THEN 1 ELSE 0 END) - (CASE WHEN from_delegate=$1 THEN 1 ELSE 0 END)) as num_of_delegators
        FROM ${namespace + ".delegate_changed_events"}
        WHERE to_delegate=$1 OR from_delegate=$1;
        `,
        address
      );

  const totalVotingPower =
    BigInt(delegate?.voting_power || 0) +
    BigInt(delegate?.advanced_vp?.toFixed(0) || 0);

  const cachedNumOfDelegators = BigInt(
    delegate.num_of_delegators?.toFixed() || "0"
  );

  // Build out delegate JSON response
  return {
    address: address,
    citizen: delegate?.citizen || false,
    votingPower: {
      total: totalVotingPower.toString(),
      direct: delegate?.voting_power?.toString() || "0",
      advanced: delegate?.advanced_vp?.toFixed(0) || "0",
    },
    votingPowerRelativeToVotableSupply: Number(
      totalVotingPower / BigInt(votableSupply || 0)
    ),
    votingPowerRelativeToQuorum:
      quorum && quorum > 0n
        ? Number((totalVotingPower * 10000n) / quorum) / 10000
        : 0,
    proposalsCreated: delegate?.proposals_proposed || 0n,
    proposalsVotedOn: delegate?.proposals_voted || 0n,
    votedFor: delegate?.for?.toString() || "0",
    votedAgainst: delegate?.against?.toString() || "0",
    votedAbstain: delegate?.abstain?.toString() || "0",
    votingParticipation: delegate?.participation_rate || 0,
    lastTenProps: delegate?.last_10_props?.toFixed() || "0",
    numOfDelegators:
      // Use cached amount when recalculation is expensive
      cachedNumOfDelegators < 1000n
        ? BigInt(
            (await numOfDelegatesQuery)?.[0]?.num_of_delegators?.toString() ||
              "0"
          )
        : cachedNumOfDelegators,
    statement: delegate?.statement || null,
  };
}

export const fetchDelegates = cache(getDelegates);
export const fetchDelegate = cache(getDelegate);
