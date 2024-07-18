import {
  paginateResult,
  paginateResultEx,
  type PaginatedResultEx,
  type PaginationParamsEx,
} from "@/app/lib/pagination";
import prisma from "@/app/lib/prisma";
import { cache } from "react";
import { isAddress } from "viem";
import { resolveENSName } from "@/app/lib/ENSUtils";
import {
  type Delegate,
  type DelegatesGetPayload,
  type DelegateStats,
} from "./delegate";
import Tenant from "@/lib/tenant/tenant";
import { fetchDelegateStatement } from "@/app/api/common/delegateStatement/getDelegateStatement";
import { fetchCurrentQuorum } from "@/app/api/common/quorum/getQuorum";
import { fetchVotableSupply } from "@/app/api/common/votableSupply/getVotableSupply";
import { doInSpan } from "@/app/lib/logging";

async function getDelegatesApi(
  sort: string,
  pagination: PaginationParamsEx,
  seed?: number
): Promise<PaginatedResultEx<any>> {
  const { namespace, slug } = Tenant.current();
  const apiDelegatesQuery = (sort: string) =>
    `
    SELECT
      delegates.delegate,
      num_of_delegators,
      direct_vp,
      avp.advanced_vp,
      voting_power,
      contract,
      am.address IS NOT NULL as citizen
    FROM
      ${namespace + ".delegates"}
    LEFT JOIN
      ${namespace + ".advanced_voting_power"} avp
    ON
      avp.delegate = delegates.delegate
    LEFT JOIN
      agora.citizens am
    ON
      LOWER(am.address) = LOWER(delegates.delegate) AND
      am.retro_funding_round = (SELECT MAX(retro_funding_round) FROM agora.citizens) AND
      am.dao_slug = $3::config.dao_slug
    WHERE
      num_of_delegators IS NOT NULL
    ORDER BY
      ${sort}
    OFFSET $1
    LIMIT $2;
  `;
  // TODO: voting power sort, others
  const paginatedQuery = async (skip: number, take: number) => {
    switch (sort) {
      case "most_delegators":
        return prisma.$queryRawUnsafe<DelegatesGetPayload[]>(
          apiDelegatesQuery("num_of_delegators DESC"),
          skip,
          take,
          slug
        );
      case "weighted_random":
        await prisma.$executeRawUnsafe(`SELECT setseed($1);`, seed);
        return prisma.$queryRawUnsafe<DelegatesGetPayload[]>(
          apiDelegatesQuery("-log(random()) / voting_power"),
          skip,
          take,
          slug
        );
      default:
        throw new Error("Invalid sort order");
    }
  };

  const result = (await doInSpan(
    { name: "getDelegatesApi" },
    async () => await paginateResultEx(paginatedQuery, pagination)
  )) as PaginatedResultEx<DelegatesGetPayload[]>;

  const delegates = result.data;
  const meta = result.meta;

  const _delegates = await Promise.all(
    delegates.map(async (delegate: DelegatesGetPayload) => {
      return {
        statement: await fetchDelegateStatement(delegate.delegate),
      };
    })
  );

  // Voting power detail added for use with API, so as to not break existing
  // components
  return {
    meta,
    data: delegates.map((delegate: any, index: number) => ({
      address: delegate.delegate,
      votingPower: {
        total: delegate.voting_power?.toFixed(0),
        direct: delegate.direct_vp?.toFixed(0),
        advanced: delegate.advanced_vp?.toFixed(0) || "0",
      },
      citizen: delegate.citizen,
      statement: _delegates[index].statement,
    })),
  };
}

/*
 * Fetches a list of delegates
 * @param page - the page number to fetch
 * @param sort - the sort order
 * @param seed - the seed for random sorting
 * @returns - a list of delegates
 */
async function getDelegates({
  page = 1,
  sort = "weighted_random",
  seed,
  filters,
}: {
  page: number;
  sort: string;
  seed?: number;
  filters?: {
    issues?: string;
    stakeholders?: string;
  };
}) {
  const pageSize = 20;
  const { namespace, ui, slug } = Tenant.current();

  const allowList = ui.delegates?.allowed || [];

  const topIssuesParam = filters?.issues || "";
  const topIssuesQuery =
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

  // TODO 1/2: There is an inconsistency between top stakeholders and top issues. Top issues are filtered by a value
  // TODO 2/2 : where the top stakeholders are filtered on type. We need to make this consistent and clean up the data and UI.
  const topStakeholdersParam = filters?.stakeholders || "";
  const topStakeholdersQuery =
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
                    warpcast
                  FROM agora.delegate_statements s
                  WHERE s.address = d.delegate AND s.dao_slug = $2::config.dao_slug
                  ${topIssuesQuery}
                  ${topStakeholdersQuery}
                  LIMIT 1
                ) sub
              ) AS statement
            FROM ${namespace + ".delegates"} d
            WHERE num_of_delegators IS NOT NULL
            AND (ARRAY_LENGTH($1::text[], 1) IS NULL OR delegate = ANY($1::text[]))
            AND EXISTS (
                SELECT 1
                FROM agora.delegate_statements s
                WHERE s.address = d.delegate
                ${topIssuesQuery}
                ${topStakeholdersQuery}
            )
            ORDER BY num_of_delegators DESC
            OFFSET $3
            LIMIT $4;
            `,
          allowList,
          slug,
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
                    warpcast
                  FROM agora.delegate_statements s
                  WHERE s.address = d.delegate AND s.dao_slug = $3::config.dao_slug
                  ${topIssuesQuery}
                  ${topStakeholdersQuery}
                  LIMIT 1
                ) sub
              ) AS statement
            FROM ${namespace + ".delegates"} d
            WHERE voting_power > 0 
            AND (ARRAY_LENGTH($2::text[], 1) IS NULL OR delegate = ANY($2::text[]))
            AND EXISTS (
                SELECT 1
                FROM agora.delegate_statements s
                WHERE s.address = d.delegate
                ${topIssuesQuery}
                ${topStakeholdersQuery}
            )
            ORDER BY -log(random()) / voting_power
            OFFSET $4
            LIMIT $5;
            `,
          seed,
          allowList,
          slug,
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
                    warpcast
                  FROM agora.delegate_statements s
                  WHERE s.address = d.delegate AND s.dao_slug = $2::config.dao_slug
                  ${topIssuesQuery}
                  ${topStakeholdersQuery}
                  LIMIT 1
                ) sub
              ) AS statement
            FROM ${namespace + ".delegates"} d
            WHERE (ARRAY_LENGTH($1::text[], 1) IS NULL OR delegate = ANY($1::text[]))
            AND EXISTS (
                SELECT 1
                FROM agora.delegate_statements s
                WHERE s.address = d.delegate
                ${topIssuesQuery}
                ${topStakeholdersQuery}
            )
            ORDER BY voting_power DESC
            OFFSET $3
            LIMIT $4;
            `,
          allowList,
          slug,
          skip,
          take
        );
    }
  };

  const { meta, data: delegates } = await paginateResult<DelegatesGetPayload[]>(
    paginatedAllowlistQuery,
    page,
    pageSize
  );

  // Voting power detail added for use with API, so as to not break existing
  // components
  return {
    meta,
    delegates: delegates.map((delegate, index) => ({
      address: delegate.delegate,
      votingPower: delegate.voting_power?.toFixed(0),
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
        } vp WHERE vp.delegate = $1 LIMIT 1) c ON TRUE
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
            warpcast
          FROM agora.delegate_statements s 
          WHERE s.address = LOWER($1) AND s.dao_slug = $3::config.dao_slug
          LIMIT 1
        ) sub
      ) AS statement ON TRUE;
    `,
    address,
    contracts.alligator?.address || "",
    slug,
    contracts.governor.address.toLowerCase()
  );

  const [delegate, votableSupply, quorum] = await Promise.all([
    delegateQuery.then((result) => result?.[0] || undefined),
    fetchVotableSupply(),
    fetchCurrentQuorum(),
  ]);

  const numOfDelegatesQuery = prisma.$queryRawUnsafe<
    { num_of_delegators: BigInt }[]
  >(
    `
    SELECT
      SUM(count) as num_of_delegators
    FROM (
      SELECT count(*)
      FROM optimism.advanced_delegatees
      WHERE "to"=$1 AND contract=$2 AND delegated_amount > 0
      UNION ALL
      SELECT
        SUM((CASE WHEN to_delegate=$1 THEN 1 ELSE 0 END) - (CASE WHEN from_delegate=$1 THEN 1 ELSE 0 END)) as num_of_delegators
      FROM center.optimism_delegate_changed_events
      WHERE to_delegate=$1 OR from_delegate=$1
    ) t;
    `,
    address,
    contracts.alligator?.address
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
    votingPower: totalVotingPower.toString(),
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
      cachedNumOfDelegators < 1000n && namespace === "optimism"
        ? BigInt(
            (await numOfDelegatesQuery)?.[0]?.num_of_delegators.toString() ||
              "0"
          )
        : cachedNumOfDelegators,
    statement: delegate?.statement || null,
  };
}

export const fetchDelegatesApi = cache(getDelegatesApi);
export const fetchDelegates = cache(getDelegates);
export const fetchDelegate = cache(getDelegate);
