import {
  type PaginatedResult,
  paginateResult,
  type PaginationParams,
} from "@/app/lib/pagination";
import { prismaWeb2Client, prismaWeb3Client } from "@/app/lib/prisma";
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
import { Prisma } from "@prisma/client";

type Web2DelegateData = {
  delegate: string;
  citizen: boolean;
  statement: string;
};

// First, let's create a new type for the cached data
type AllWeb2DelegateData = {
  delegate: string;
  citizen: boolean;
  statement: string;
};

// Create a new cache function for all delegate statements
const getAllWeb2DelegateDataCached = cache(
  async (
    slug: string,
    filters?: {
      endorsed?: boolean;
      issues?: string;
      stakeholders?: string;
    }
  ): Promise<AllWeb2DelegateData[]> => {
    const endorsedFilterQuery = filters?.endorsed
      ? `AND endorsed = true AND dao_slug = '${slug}'`
      : "";

    const topIssuesParam = filters?.issues || "";
    const topIssuesArray = topIssuesParam
      ? topIssuesParam.split(",").map((issue) => issue.trim())
      : [];

    const topIssuesFilterQuery =
      topIssuesParam && topIssuesParam !== ""
        ? `
        AND jsonb_array_length(payload -> 'topIssues') > 0
        AND EXISTS (
          SELECT 1
          FROM jsonb_array_elements(payload -> 'topIssues') elem
          WHERE elem ->> 'type' IN (${topIssuesArray.map((issue) => `'${issue}'`).join(", ")})
          AND elem ->> 'value' IS NOT NULL
          AND elem ->> 'value' <> ''
        )
        `
        : "";

    const topStakeholdersParam = filters?.stakeholders || "";
    const topStakeholdersFilterQuery =
      topStakeholdersParam && topStakeholdersParam !== ""
        ? `
        AND jsonb_array_length(payload -> 'topStakeholders') > 0
        AND EXISTS (
          SELECT 1
          FROM jsonb_array_elements(payload -> 'topStakeholders') elem
          WHERE elem ->> 'type' = '${topStakeholdersParam}'
        )
        `
        : "";

    const web2Query = `
    WITH delegate_statements_enriched AS (
      SELECT 
        address as delegate,
        CASE
          WHEN EXISTS (
            SELECT 1
            FROM agora.citizens
            WHERE LOWER(address) = LOWER(ds.address) 
            AND dao_slug = '${slug}'
          ) THEN TRUE
          ELSE FALSE
        END AS citizen,
        row_to_json(ds.*) as statement
      FROM agora.delegate_statements ds
      WHERE ds.dao_slug = '${slug}'
      ${endorsedFilterQuery}
      ${topIssuesFilterQuery}
      ${topStakeholdersFilterQuery}
    )
    SELECT * FROM delegate_statements_enriched
    `;

    return prismaWeb2Client.$queryRawUnsafe(web2Query);
  }
);

// Modify the existing getWeb2DelegateDataCached to use the cached results
const getWeb2DelegateDataCached = cache(
  async (
    delegates: string[],
    slug: string,
    filters?: {
      delegator?: `0x${string}`;
      issues?: string;
      stakeholders?: string;
      endorsed?: boolean;
    }
  ): Promise<Web2DelegateData[]> => {
    const allDelegateData = await getAllWeb2DelegateDataCached(slug, filters);

    // Filter the cached results for the requested delegates
    return allDelegateData.filter((d) =>
      delegates
        .map((addr) => addr.toLowerCase())
        .includes(d.delegate.toLowerCase())
    );
  }
);

type Web3DelegateData = {
  delegate: string;
  num_of_delegators: number;
  direct_vp: Prisma.Decimal;
  advanced_vp: Prisma.Decimal;
  voting_power: Prisma.Decimal;
};

async function getWeb3DelegateData({
  pagination,
  sort,
  seed,
  filters,
  namespace,
  tokenAddress,
}: {
  pagination: PaginationParams;
  sort: string;
  seed?: number;
  filters?: {
    delegator?: `0x${string}`;
    issues?: string;
    stakeholders?: string;
    endorsed?: boolean;
  };
  namespace: string;
  tokenAddress: string;
}): Promise<Web3DelegateData[]> {
  const { ui, slug, contracts } = Tenant.current();

  const allowList = ui.delegates?.allowed || [];

  const endorsedFilterQuery = filters?.endorsed
    ? `AND endorsed = true AND s.dao_slug = '${slug}'`
    : "";

  // The top issues filter supports multiple selection - a comma separated list of issues
  const topIssuesParam = filters?.issues || "";
  const topIssuesArray = topIssuesParam
    ? topIssuesParam.split(",").map((issue) => issue.trim())
    : [];

  const topIssuesFilterQuery =
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

  const delegateStatementFiler =
    filters?.endorsed || filters?.issues || filters?.stakeholders
      ? `AND EXISTS (
        SELECT 1
        FROM agora.delegate_statements s
        WHERE s.address = d.delegate
        ${endorsedFilterQuery}
        ${topIssuesFilterQuery}
        ${topStakeholdersFilterQuery}
      )`
      : "";

  let delegateUniverseCTE: string;
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

  const query = `
    ${delegateUniverseCTE}
    SELECT 
      d.delegate,
      d.num_of_delegators,
      d.direct_vp,
      d.advanced_vp,
      d.voting_power
    FROM del_card_universe d
    ORDER BY ${
      sort === "most_delegators"
        ? "num_of_delegators DESC"
        : sort === "weighted_random"
          ? "-log(random()) / NULLIF(voting_power, 0)"
          : "voting_power DESC"
    }, 
            d.delegate
    OFFSET $1
    LIMIT $2
  `;

  if (sort === "weighted_random") {
    await prismaWeb3Client.$executeRawUnsafe(`SELECT setseed($1);`, seed);
  }

  return prismaWeb3Client.$queryRawUnsafe(
    query,
    pagination.offset,
    pagination.limit
  );
}

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
  };
}): Promise<PaginatedResult<DelegateChunk[]>> {
  const { namespace, ui, slug, contracts } = Tenant.current();
  const allowList = ui.delegates?.allowed || [];

  // Get web3 data first
  const web3Data = await getWeb3DelegateData({
    pagination,
    sort,
    seed,
    filters,
    namespace,
    tokenAddress: contracts.token.address,
  });

  // Get web2 data for the delegates we found
  const delegateAddresses = web3Data.map((d) => d.delegate);
  const web2Data = await getWeb2DelegateDataCached(
    delegateAddresses,
    slug,
    filters
  );

  // Create a map for quick lookup of web2 data
  const web2DataMap = new Map(web2Data.map((d) => [d.delegate, d]));

  // Combine the data
  const delegates = web3Data.map((delegate) => {
    const web2Info = web2DataMap.get(delegate.delegate) || {
      citizen: false,
      statement: null,
    };

    return {
      address: delegate.delegate,
      votingPower: {
        total: delegate.voting_power?.toFixed(0) || "0",
        direct: delegate.direct_vp?.toFixed(0) || "0",
        advanced: delegate.advanced_vp?.toFixed(0) || "0",
      },
      citizen: web2Info.citizen,
      statement: web2Info.statement,
      numOfDelegators: BigInt(delegate.num_of_delegators || "0"),
    };
  });

  // Filter out delegates not in allowList if it exists
  const filteredDelegates =
    allowList.length > 0
      ? delegates.filter((d) =>
          allowList
            .map((a) => a.toLowerCase())
            .includes(d.address.toLowerCase())
        )
      : delegates;

  return {
    meta: {
      has_next: filteredDelegates.length === pagination.limit,
      total_returned: filteredDelegates.length,
      next_offset: pagination.offset + pagination.limit,
    },
    data: filteredDelegates,
    seed,
  };
}

async function getDelegate(addressOrENSName: string): Promise<Delegate> {
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
}

async function getVoterStats(
  addressOrENSName: string,
  blockNumber?: number
): Promise<any> {
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
}

export const fetchDelegates = cache(getDelegates);
export const fetchDelegate = cache(getDelegate);
export const fetchVoterStats = cache(getVoterStats);
