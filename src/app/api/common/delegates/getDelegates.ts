import {
  type PaginatedResult,
  paginateResult,
  type PaginationParams,
} from "@/app/lib/pagination";
import { prismaWeb3Client } from "@/app/lib/prisma";
import { cache } from "react";
import { isAddress } from "viem";
import { ensNameToAddress } from "@/app/lib/ENSUtils";
import {
  type Delegate,
  DelegateChunk,
  type DelegatesGetPayload,
  type DelegateStats,
} from "./delegate";
import Tenant from "@/lib/tenant/tenant";
import { fetchCurrentQuorum } from "@/app/api/common/quorum/getQuorum";
import { fetchVotableSupply } from "@/app/api/common/votableSupply/getVotableSupply";
import { doInSpan } from "@/app/lib/logging";
import { DELEGATION_MODEL, TENANT_NAMESPACES } from "@/lib/constants";
import { getProxyAddress } from "@/lib/alligatorUtils";
import { calculateBigIntRatio } from "../utils/bigIntRatio";
import { withMetrics } from "@/lib/metricWrapper";

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
  pagination?: PaginationParams;
  sort: string;
  seed?: number;
  filters?: {
    delegator?: `0x${string}`;
    issues?: string;
    stakeholders?: string;
    endorsed?: boolean;
    hasStatement?: boolean;
  };
}): Promise<PaginatedResult<DelegateChunk[]>> {
  return withMetrics(
    "getDelegates",
    async () => {
      const { namespace, ui, slug, contracts } = Tenant.current();

      const allowList = ui.delegates?.allowed || [];

      // The top issues filter supports multiple selection - a comma separated list of issues
      const topIssuesParam = filters?.issues || "";
      const topStakeholdersParam = filters?.stakeholders || "";

      const topIssuesArray = topIssuesParam
        ? topIssuesParam.split(",").map((issue) => issue.trim())
        : [];

      const endorsedCondition = filters?.endorsed ? `AND endorsed = true` : "";

      const issuesCondition =
        topIssuesParam && topIssuesParam !== ""
          ? `
          AND jsonb_array_length(s.payload -> 'topIssues') > 0
          AND EXISTS (
            SELECT 1
            FROM jsonb_array_elements(s.payload -> 'topIssues') elem
            WHERE elem ->> 'type' IN (${topIssuesArray.map((issue) => `'${issue}'`).join(", ")})
            AND elem ->> 'value' IS NOT NULL
            AND elem ->> 'value' <> ''
          )
        `
          : "";

      // Note: There is an inconsistency between top stakeholders and top issues. Top issues are filtered by a value
      // where the top stakeholders are filtered on type. We need to make this consistent and clean up the data and UI.
      const stakeholdersCondition =
        topStakeholdersParam && topStakeholdersParam !== ""
          ? `
          AND jsonb_array_length(s.payload -> 'topStakeholders') > 0
          AND EXISTS (
            SELECT 1
            FROM jsonb_array_elements(s.payload -> 'topStakeholders') elem
            WHERE elem ->> 'type' = '${topStakeholdersParam}'
          )
        `
          : "";

      // Add hasStatement filter condition
      const hasStatementCondition = filters?.hasStatement
        ? `
          AND s.payload IS NOT NULL 
          AND s.payload != '{}'::jsonb
          AND s.payload ? 'delegateStatement'
          AND s.payload ->> 'delegateStatement' != ''
          AND LENGTH(s.payload ->> 'delegateStatement') >= 10
        `
        : "";

      // Combine all statement-related filters
      const delegateStatementFilter =
        filters?.endorsed ||
        filters?.issues ||
        filters?.stakeholders ||
        filters?.hasStatement
          ? `AND EXISTS (
              SELECT 1
              FROM agora.delegate_statements s
              WHERE s.address = d.delegate
              AND s.dao_slug = '${slug}'
              ${endorsedCondition}
              ${issuesCondition}
              ${stakeholdersCondition}
              ${hasStatementCondition}
            )`
          : "";

      let delegateUniverseCTE: string;
      const tokenAddress = contracts.token.address;
      const proxyAddress = filters?.delegator
        ? await getProxyAddress(filters?.delegator?.toLowerCase())
        : null;

      // This toggle for Deriver should be a temporary one, and reverted within ~1 week.
      // They don't have a token yet, so nobody can delegate.
      // This makes the universe include all delegate statements, albeit in a sloppy
      // way.  It's structured to mirror the SQL for the other more complex CTE.
      if (namespace === TENANT_NAMESPACES.DERIVE) {
        delegateUniverseCTE = `
        with del_statements as (
          select address
          from agora.delegate_statements
          where dao_slug='${slug}'
        ),
        filtered_delegates_both as (
          select
            address as delegate,
            0 as num_of_delegators,
            0 as direct_vp,
            0 as advanced_vp,
            0 as voting_power
            from agora.delegate_statements where dao_slug='DERIVE'
          union
            select
              d.delegate as delegate,
              d.num_of_delegators as num_of_delegators,
              d.direct_vp as direct_vp,
              d.advanced_vp as advanced_vp,
              d.voting_power as voting_power
            from ${namespace}.delegates d
            where d.contract = '${tokenAddress}'
        ),
        filtered_delegates as (
          select
          delegate,
          sum(num_of_delegators) as num_of_delegators,
          sum(direct_vp) as direct_vp,
          sum(advanced_vp) as advanced_vp,
          sum(voting_power) as voting_power
          from filtered_delegates_both group by delegate
        ),
        del_card_universe as (
          select
            d.delegate as delegate,
            d.num_of_delegators as num_of_delegators,
            d.direct_vp as direct_vp,
            d.advanced_vp as advanced_vp,
            d.voting_power as voting_power
          from filtered_delegates d
        )`;
      } else {
        delegateUniverseCTE = `
        with del_statements as (
          select address
          from agora.delegate_statements
          where dao_slug='${slug}'
        ),
        filtered_delegates as (
          select d.*
          from ${namespace}.delegates d
          where d.contract = '${tokenAddress}'
          ${
            filters?.delegator
              ? `
            AND d.delegate IN (
              SELECT delegatee
              FROM (
                SELECT delegatee, block_number
                FROM ${namespace}.delegatees
                WHERE delegator = '${filters.delegator.toLowerCase()}'
                ${proxyAddress ? `AND delegatee <> '${proxyAddress.toLowerCase()}'` : ""}
                AND contract = '${tokenAddress}'
                UNION ALL
                SELECT "to" as delegatee, block_number
                FROM ${namespace}.advanced_delegatees
                WHERE "from" = '${filters.delegator.toLowerCase()}'
                AND delegated_amount > 0
                AND contract = '${contracts.alligator?.address || tokenAddress}'
              ) combined_delegations
              ORDER BY block_number DESC
            )
          `
              : ""
          }
        ),
        del_card_universe as (
          select
            d.delegate as delegate,
            d.num_of_delegators as num_of_delegators,
            d.direct_vp as direct_vp,
            d.advanced_vp as advanced_vp,
            d.voting_power as voting_power
          from filtered_delegates d
        )`;
      }
      // Applies allow-list filtering to the delegate list
      const paginatedAllowlistQuery = async (skip: number, take: number) => {
        const allowListString = allowList
          .map((value) => `'${value}'`)
          .join(", ");

        switch (sort) {
          case "most_delegators":
            const QRY1 = `
              ${delegateUniverseCTE}
              SELECT *,
                CASE
                  WHEN EXISTS (
                    SELECT 1
                    FROM agora.citizens
                    WHERE LOWER(address) = d.delegate AND dao_slug='${slug}'::config.dao_slug
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
                    WHERE s.address = d.delegate AND s.dao_slug = '${slug}'::config.dao_slug
                    ${endorsedCondition}
                    ${issuesCondition}
                    ${stakeholdersCondition}
                    ${hasStatementCondition}
                    LIMIT 1
                  ) sub
                ) AS statement
              FROM del_card_universe d
              WHERE num_of_delegators IS NOT NULL
              AND (ARRAY_LENGTH(ARRAY[${allowListString}]::text[], 1) IS NULL OR d.delegate = ANY(ARRAY[${allowListString}]::text[]))
              ${delegateStatementFilter}
              ORDER BY num_of_delegators DESC, d.delegate
              OFFSET $1
              LIMIT $2;
            `;
            return prismaWeb3Client.$queryRawUnsafe<DelegatesGetPayload[]>(
              QRY1,
              skip,
              take
            );

          case "weighted_random":
            await prismaWeb3Client.$executeRawUnsafe(
              `SELECT setseed($1);`,
              seed
            );

            const QRY2 = ` ${delegateUniverseCTE}
              SELECT *,
                CASE
                  WHEN EXISTS (
                    SELECT 1
                    FROM agora.citizens
                    WHERE LOWER(address) = d.delegate AND dao_slug='${slug}'::config.dao_slug
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
                    WHERE s.address = d.delegate AND s.dao_slug = '${slug}'::config.dao_slug
                    ${endorsedCondition}
                    ${issuesCondition}
                    ${stakeholdersCondition}
                    ${hasStatementCondition}
                    LIMIT 1
                  ) sub
                ) AS statement
              FROM del_card_universe d
              WHERE (ARRAY_LENGTH(ARRAY[${allowListString}]::text[], 1) IS NULL OR delegate = ANY(ARRAY[${allowListString}]::text[]))
              ${delegateStatementFilter}
             ORDER BY -log(random()) / NULLIF(voting_power, 0)
              OFFSET $1
              LIMIT $2;
              `;
            return prismaWeb3Client.$queryRawUnsafe<DelegatesGetPayload[]>(
              QRY2,
              skip,
              take
            );

          default:
            const sortDirection =
              sort === "least_voting_power" ? "ASC" : "DESC";
            const QRY3 = `
              ${delegateUniverseCTE}
              SELECT *,
                CASE
                  WHEN EXISTS (
                    SELECT 1
                    FROM agora.citizens
                    WHERE LOWER(address) = d.delegate AND dao_slug='${slug}'::config.dao_slug
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
                    WHERE s.address = d.delegate AND s.dao_slug = '${slug}'::config.dao_slug
                    ${endorsedCondition}
                    ${issuesCondition}
                    ${stakeholdersCondition}
                    ${hasStatementCondition}
                    LIMIT 1
                  ) sub
                ) AS statement
              FROM del_card_universe d
              WHERE (ARRAY_LENGTH(ARRAY[${allowListString}]::text[], 1) IS NULL OR delegate = ANY(ARRAY[${allowListString}]::text[]))
              ${delegateStatementFilter}
              ORDER BY voting_power ${sortDirection}, d.delegate
              OFFSET $1
              LIMIT $2;
              `;
            return prismaWeb3Client.$queryRawUnsafe<DelegatesGetPayload[]>(
              QRY3,
              skip,
              take
            );
        }
      };

      const { meta, data: delegates } = await doInSpan(
        { name: "getDelegates" },
        async () =>
          await paginateResult<DelegatesGetPayload>(
            paginatedAllowlistQuery,
            pagination
          )
      );

      // Voting power detail added for use with API, so as to not break existing
      // components
      return {
        meta,
        data: await processDelegatesWithDelegators(
          delegates,
          namespace,
          contracts
        ),
        seed,
      };
    },
    { sort }
  );
}

async function processDelegatesWithDelegators(
  delegates: DelegatesGetPayload[],
  namespace: string,
  contracts: any
) {
  // Prepare queries once for all delegates
  const numOfAdvancedDelegationsQuery = `SELECT count(*) as num_of_delegators, "to" as delegate_address
    FROM ${namespace + ".advanced_delegatees"}
    WHERE "to" = ANY($1) AND contract=$2 AND delegated_amount > 0
    GROUP BY "to"`;

  let numOfDirectDelegationsQuery;
  if (contracts.token.isERC20()) {
    numOfDirectDelegationsQuery = `
      SELECT 
        delegate_address,
        SUM(num_delegators) as num_of_delegators
      FROM (
        SELECT 
          to_delegate as delegate_address,
          COUNT(*) as num_delegators
        FROM ${namespace + ".delegate_changed_events"}
        WHERE to_delegate = ANY($1) AND address=$2
        GROUP BY to_delegate
        
        UNION ALL
        
        SELECT 
          from_delegate as delegate_address,
          -COUNT(*) as num_delegators
        FROM ${namespace + ".delegate_changed_events"}
        WHERE from_delegate = ANY($1) AND address=$2
        GROUP BY from_delegate
      ) t
      GROUP BY delegate_address`;
  } else if (contracts.token.isERC721()) {
    numOfDirectDelegationsQuery = `
      WITH latest_delegations AS (
        SELECT DISTINCT ON (delegator)
            delegator,
            to_delegate,
            chain_id,
            address,
            block_number,
            transaction_index,
            log_index
        FROM
            ${namespace}.delegate_changed_events 
        WHERE address = $2 AND to_delegate = ANY($1)
        ORDER BY
            delegator,
            block_number DESC,
            transaction_index DESC,
            log_index DESC
      )
      SELECT to_delegate as delegate_address, count(*) as num_of_delegators 
      FROM latest_delegations 
      GROUP BY to_delegate`;
  } else {
    throw new Error("Token contract is neither ERC20 nor ERC721?");
  }

  const partialDelegationContract = contracts.alligator
    ? contracts.alligator.address
    : contracts.token.address;

  // Filter delegates that need recalculation (cached count < 1000)
  const delegatesNeedingRecalculation = delegates.filter(
    (delegate) => BigInt(delegate.num_of_delegators || "0") < 1000n
  );

  // If no delegates need recalculation, return the processed delegates with cached counts
  if (delegatesNeedingRecalculation.length === 0) {
    return delegates.map((delegate) => ({
      address: delegate.delegate,
      votingPower: {
        total: delegate.voting_power?.toFixed(0) || "0",
        direct: delegate.direct_vp?.toFixed(0) || "0",
        advanced: delegate.advanced_vp?.toFixed(0) || "0",
      },
      citizen: delegate.citizen,
      statement: delegate.statement,
      numOfDelegators: BigInt(delegate.num_of_delegators || "0"),
    }));
  }

  // Extract addresses for batch query
  const delegateAddresses = delegatesNeedingRecalculation.map(
    (d) => d.delegate
  );

  // Execute the appropriate batch query based on contract type
  let delegatorCounts: Record<string, bigint> = {};

  if (contracts.alligator) {
    // For alligator contracts, we need to combine both queries
    const advancedQuery = await prismaWeb3Client.$queryRawUnsafe<
      { num_of_delegators: BigInt; delegate_address: string }[]
    >(
      numOfAdvancedDelegationsQuery,
      delegateAddresses,
      partialDelegationContract
    );

    const directQuery = await prismaWeb3Client.$queryRawUnsafe<
      { num_of_delegators: BigInt; delegate_address: string }[]
    >(
      numOfDirectDelegationsQuery,
      delegateAddresses,
      partialDelegationContract
    );

    // Combine results from both queries
    const combinedResults: Record<string, bigint> = {};

    advancedQuery.forEach((row) => {
      const address = row.delegate_address.toLowerCase();
      combinedResults[address] =
        (combinedResults[address] || 0n) +
        BigInt(row.num_of_delegators.toString() || "0");
    });

    directQuery.forEach((row) => {
      const address = row.delegate_address.toLowerCase();
      combinedResults[address] =
        (combinedResults[address] || 0n) +
        BigInt(row.num_of_delegators.toString() || "0");
    });

    delegatorCounts = combinedResults;
  } else if (contracts.delegationModel === DELEGATION_MODEL.PARTIAL) {
    // For partial delegation model, use advanced delegations query
    const results = await prismaWeb3Client.$queryRawUnsafe<
      { num_of_delegators: BigInt; delegate_address: string }[]
    >(
      numOfAdvancedDelegationsQuery,
      delegateAddresses,
      partialDelegationContract
    );

    results.forEach((row) => {
      delegatorCounts[row.delegate_address.toLowerCase()] = BigInt(
        row.num_of_delegators.toString() || "0"
      );
    });
  } else {
    // For direct delegation model, use direct delegations query
    const results = await prismaWeb3Client.$queryRawUnsafe<
      { num_of_delegators: BigInt; delegate_address: string }[]
    >(
      numOfDirectDelegationsQuery,
      delegateAddresses,
      partialDelegationContract
    );

    results.forEach((row) => {
      delegatorCounts[row.delegate_address.toLowerCase()] = BigInt(
        row.num_of_delegators.toString() || "0"
      );
    });
  }

  // Process all delegates with the batch results
  return delegates.map((delegate) => {
    const delegateAddress = delegate.delegate.toLowerCase();
    const cachedNumOfDelegators = BigInt(delegate.num_of_delegators || "0");

    // Use the batch result if available, otherwise use cached value
    const numOfDelegators =
      cachedNumOfDelegators < 1000n
        ? delegatorCounts[delegateAddress] || 0n
        : cachedNumOfDelegators;

    return {
      address: delegate.delegate,
      votingPower: {
        total: delegate.voting_power?.toFixed(0) || "0",
        direct: delegate.direct_vp?.toFixed(0) || "0",
        advanced: delegate.advanced_vp?.toFixed(0) || "0",
      },
      citizen: delegate.citizen,
      statement: delegate.statement,
      numOfDelegators,
    };
  });
}

async function getDelegate(addressOrENSName: string): Promise<Delegate> {
  return withMetrics("getDelegate", async () => {
    const { namespace, contracts, slug } = Tenant.current();
    const address = isAddress(addressOrENSName)
      ? addressOrENSName.toLowerCase()
      : await ensNameToAddress(addressOrENSName);

    // Eventually want to deprecate voter_stats from this query
    // we are already relying on getVoterStats below
    // but this voter_stats view includes things like for/against/abstain
    // so we can't totally pull it out
    const delegateQuery = prismaWeb3Client.$queryRawUnsafe<DelegateStats[]>(
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
          statement.statement,
          COALESCE(total_proposals.count, 0) as total_proposals
        FROM
            (SELECT 1 as dummy) dummy_table
        LEFT JOIN
            (SELECT * FROM ${namespace + ".voter_stats"} WHERE voter = $1 AND contract = $4) a ON TRUE
        LEFT JOIN
          ${namespace + ".advanced_voting_power"} av ON av.delegate = $1 AND av.contract = $2
        LEFT JOIN
            (SELECT num_of_delegators FROM ${namespace + ".delegates"} nd WHERE delegate = $1 AND nd.contract = $5 LIMIT 1) b ON TRUE
        LEFT JOIN
            (SELECT * FROM ${namespace + ".voting_power"} vp WHERE vp.delegate = $1 AND vp.contract = $5 LIMIT 1) c ON TRUE
        LEFT JOIN
            (SELECT COUNT(*) as count
             FROM ${namespace + ".proposals_v2"} p
             WHERE p.contract = $4
             AND p.cancelled_block IS NULL
            ) total_proposals ON TRUE
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
                email,
                discord,
                created_at,
                updated_at,
                warpcast,
                endorsed,
                scw_address,
                notification_preferences
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

    const numOfAdvancedDelegationsQuery = `SELECT count(*) as num_of_delegators
            FROM ${namespace + ".advanced_delegatees"}
            WHERE "to"=$1 AND contract=$2 AND delegated_amount > 0`;
    var numOfDirectDelegationsQuery;

    if (contracts.token.isERC20()) {
      numOfDirectDelegationsQuery = `        SELECT
            SUM((CASE WHEN to_delegate=$1 THEN 1 ELSE 0 END) - (CASE WHEN from_delegate=$1 THEN 1 ELSE 0 END)) as num_of_delegators
          FROM ${namespace + ".delegate_changed_events"}
          WHERE (to_delegate=$1 OR from_delegate=$1) AND address=$2`;
    } else if (contracts.token.isERC721()) {
      numOfDirectDelegationsQuery = `with latest_delegations AS (
                                              SELECT DISTINCT ON (delegator)
                                                  delegator,
                                                  to_delegate,
                                                  chain_id,
                                                  address,
                                                  block_number,
                                                  transaction_index,
                                                  log_index
                                              FROM
                                                  ${namespace}.delegate_changed_events WHERE address = $2
                                              ORDER BY
                                                  delegator,
                                                  block_number DESC,
                                                  transaction_index DESC,
                                                  log_index DESC)

                                              SELECT count(*) as num_of_delegators from latest_delegations where to_delegate = LOWER($1);`;
    } else {
      throw new Error("Token contract is neither ERC20 nor ERC721?");
    }
    var numOfDelegationsQuery;

    const partialDelegationContract = contracts.alligator
      ? contracts.alligator.address
      : contracts.token.address;

    if (contracts.alligator) {
      numOfDelegationsQuery = prismaWeb3Client.$queryRawUnsafe<
        { num_of_delegators: BigInt }[]
      >(
        `
          SELECT
            SUM(num_of_delegators) as num_of_delegators
          FROM (
            ${numOfAdvancedDelegationsQuery}
            UNION ALL
            ${numOfDirectDelegationsQuery}
          ) t;
          `,
        address,
        partialDelegationContract
      );
    } else if (contracts.delegationModel === DELEGATION_MODEL.PARTIAL) {
      numOfDelegationsQuery = prismaWeb3Client.$queryRawUnsafe<
        { num_of_delegators: BigInt }[]
      >(numOfAdvancedDelegationsQuery, address, partialDelegationContract);
    } else {
      numOfDelegationsQuery = prismaWeb3Client.$queryRawUnsafe<
        { num_of_delegators: BigInt }[]
      >(numOfDirectDelegationsQuery, address, partialDelegationContract);
    }

    const totalVotingPower =
      BigInt(delegate?.voting_power || 0) +
      BigInt(delegate?.advanced_vp?.toFixed(0) || 0);

    const cachedNumOfDelegators = BigInt(
      delegate.num_of_delegators?.toFixed() || "0"
    );

    const usedNumOfDelegators =
      cachedNumOfDelegators < 1000n
        ? BigInt(
            (await numOfDelegationsQuery)?.[0]?.num_of_delegators?.toString() ||
              "0"
          )
        : cachedNumOfDelegators;

    const relativeVotingPowerToVotableSupply = calculateBigIntRatio(
      totalVotingPower,
      BigInt(votableSupply)
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
      votingPowerRelativeToVotableSupply:
        votableSupply && BigInt(votableSupply) > 0n
          ? Number(totalVotingPower / BigInt(votableSupply || 0))
          : 0,
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
      numOfDelegators: usedNumOfDelegators,
      totalProposals: delegate?.total_proposals || 0,
      statement: delegate?.statement || null,
      relativeVotingPowerToVotableSupply,
    };
  });
}

async function getVoterStats(
  addressOrENSName: string,
  blockNumber?: number
): Promise<any> {
  return withMetrics("getVoterStats", async () => {
    const { namespace, contracts } = Tenant.current();
    const address = isAddress(addressOrENSName)
      ? addressOrENSName.toLowerCase()
      : await ensNameToAddress(addressOrENSName);

    const statsQuery = await prismaWeb3Client.$queryRawUnsafe<
      Pick<DelegateStats, "voter" | "last_10_props">[]
    >(
      `
        WITH last_10_props AS (
            SELECT proposal_id
            FROM ${namespace}.proposals_v2
            WHERE contract = $2
            AND end_block::INTEGER <= $3
            AND cancelled_block IS NULL
            AND proposal_type <> 'OPTIMISTIC'
            ORDER BY ordinal DESC
            LIMIT 10
        ),
        total_proposals AS (
            SELECT COUNT(*) as count
            FROM ${namespace}.proposals_v2
            WHERE contract = $2
            AND cancelled_block IS NULL
        )
        SELECT
            COALESCE(v.voter, $1) as voter,
            COALESCE(sum((
                SELECT count(DISTINCT last_10_props.proposal_id) AS count
                FROM last_10_props
                WHERE last_10_props.proposal_id = v.proposal_id
            )), 0::bigint) AS last_10_props,
            total_proposals.count AS total_proposals
        FROM total_proposals
        LEFT JOIN ${namespace}.votes v ON
            v.voter = $1
            AND v.contract = $2
        GROUP BY COALESCE(v.voter, $1), total_proposals.count;
        `,
      address,
      contracts.governor.address.toLowerCase(),
      blockNumber || 0
    );
    return (
      statsQuery?.[0] || {
        voter: address,
        total_proposals: 0,
        last_10_props: 0,
      }
    );
  });
}

export const fetchDelegates = cache(getDelegates);
export const fetchDelegate = cache(getDelegate);
export const fetchVoterStats = cache(getVoterStats);
