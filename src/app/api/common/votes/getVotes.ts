import {
  PaginatedResult,
  paginateResult,
  PaginationParams,
} from "@/app/lib/pagination";
import { ParsedProposalData, parseProposalData } from "@/lib/proposalUtils";
import { parseSnapshotVote, parseVote } from "@/lib/voteUtils";
import { cache } from "react";
import {
  SnapshotVote,
  SnapshotVotePayload,
  Vote,
  VotePayload,
  VoterTypes,
  VotesSort,
} from "./vote";
import { prismaWeb3Client } from "@/app/lib/prisma";
import { addressOrEnsNameWrap } from "../utils/ensName";
import Tenant from "@/lib/tenant/tenant";
import { doInSpan } from "@/app/lib/logging";
import { findVotes } from "@/lib/prismaUtils";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { Block } from "ethers";
import { withMetrics } from "@/lib/metricWrapper";
import { unstable_cache } from "next/cache";
import { ProposalType } from "@/lib/types";
import { fetchProposalFromArchive } from "@/lib/archiveUtils";

const getVotesForDelegate = ({
  addressOrENSName,
  pagination,
}: {
  addressOrENSName: string;
  pagination?: PaginationParams;
}) =>
  addressOrEnsNameWrap(getVotesForDelegateForAddress, addressOrENSName, {
    pagination,
  });

async function getVotesForDelegateForAddress({
  address,
  pagination = { offset: 0, limit: 20 },
}: {
  address: string;
  pagination?: PaginationParams;
}) {
  return withMetrics("getVotesForDelegateForAddress", async () => {
    const { namespace, contracts, ui } = Tenant.current();

    let eventsViewName;

    if (namespace == TENANT_NAMESPACES.OPTIMISM) {
      eventsViewName = "vote_cast_with_params_events_v2";
    } else {
      eventsViewName = "vote_cast_with_params_events";
    }

    const queryFunction = (skip: number, take: number) => {
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
      return prismaWeb3Client.$queryRawUnsafe<VotePayload[]>(
        query,
        address,
        contracts.governor.address.toLowerCase(),
        skip,
        take
      );
    };

    const { meta, data: votes } = await doInSpan(
      { name: "getVotesForDelegate" },
      async () => paginateResult(queryFunction, pagination)
    );

    if (!votes || votes.length === 0) {
      return {
        meta,
        data: [],
      };
    }

    const latestBlock = ui.toggle("use-l1-block-number")?.enabled
      ? await contracts.providerForTime?.getBlock("latest")
      : await contracts.token.provider.getBlock("latest");

    const archiveMode =
      ui.toggle("use-archive-for-proposal-details")?.enabled ?? false;

    const data = await Promise.all(
      votes.map(async (vote) => {
        // When using archive-backed proposals, DB may not have proposal_data/type.
        // Render past votes anyway with sane defaults.
        const safeProposalType =
          (vote as any).proposal_type ??
          (archiveMode ? ("STANDARD" as ProposalType) : (undefined as any));

        let proposalData: ParsedProposalData[ProposalType] | undefined =
          undefined;
        try {
          if (vote.proposal_data) {
            proposalData = parseProposalData(
              JSON.stringify(vote.proposal_data),
              safeProposalType
            );
          }
        } catch (e) {
          // Ignore parse errors; we can still show minimal vote info
          proposalData = undefined;
        }

        // Pass through proposal_type default if missing in archive mode
        const voteWithType = safeProposalType
          ? ({
              ...(vote as any),
              proposal_type: safeProposalType,
            } as VotePayload)
          : (vote as VotePayload);

        let archiveTitle = "";
        let isTempCheck = false;
        let easOodaoMetadata: { createdBlockNumber: number } | null = null;

        // Always source the proposal title from the archive when archive mode is enabled
        if (archiveMode) {
          try {
            const { namespace } = Tenant.current();
            const archiveProposal: any = await fetchProposalFromArchive(
              namespace,
              vote.proposal_id as unknown as string
            );

            if (archiveProposal) {
              archiveTitle =
                typeof archiveProposal?.title === "string"
                  ? archiveProposal.title
                  : "";

              // Surface a simple hint for UI copy (e.g., temp check vs proposal)
              const tags: string[] = Array.isArray(archiveProposal?.tags)
                ? archiveProposal.tags
                : [];
              if (tags.includes("tempcheck")) {
                isTempCheck = true;
              }

              // For eas-oodao proposals, pass metadata for client-side lazy loading
              if (
                archiveProposal?.data_eng_properties?.source === "eas-oodao" &&
                archiveProposal?.created_block_number
              ) {
                easOodaoMetadata = {
                  createdBlockNumber: archiveProposal.created_block_number,
                };
              }
            }
          } catch (_) {
            // ignore archive fetch errors; keep parsed title as-is
          }
        }

        const parsed = await parseVote(voteWithType, proposalData, latestBlock);

        // Apply archive data to parsed vote
        if (archiveMode) {
          if (archiveTitle && archiveTitle.trim().length > 0) {
            parsed.proposalTitle = archiveTitle;
          }
          if (isTempCheck) {
            (parsed as any).isTempCheck = true;
          }
          if (easOodaoMetadata) {
            parsed.easOodaoMetadata = easOodaoMetadata;
          }
        }

        return parsed;
      })
    );
    return {
      meta,
      data,
    };
  });
}

const getSnapshotVotesForDelegate = async ({
  addressOrENSName,
  pagination,
}: {
  addressOrENSName: string;
  pagination?: PaginationParams;
}) =>
  addressOrEnsNameWrap(
    getSnapshotVotesForDelegateForAddress,
    addressOrENSName,
    {
      pagination,
    }
  );

async function getSnapshotVotesForDelegateForAddress({
  address,
  pagination = { offset: 0, limit: 20 },
}: {
  address: string;
  pagination?: PaginationParams;
}): Promise<PaginatedResult<SnapshotVote[]>> {
  return withMetrics("getSnapshotVotesForDelegateForAddress", async () => {
    const { slug } = Tenant.current();

    const queryFunction = (skip: number, take: number) => {
      const query = `
          SELECT "vote".id,
                 "vote".voter,
                 "vote".created,
                 "vote".choice,
                 "vote".metadata,
                 "vote".reason,
                 "vote".app,
                 "vote".vp,
                 "vote".vp_by_strategy,
                 "vote".vp_state,
                 "vote".proposal_id,
                 "vote".choice_labels,
                 "proposal".title
          FROM "snapshot".votes as "vote"
          INNER JOIN "snapshot".proposals AS "proposal" ON "vote".proposal_id = "proposal".id
          WHERE "vote".dao_slug = '${slug}'
          AND "vote".voter = '${address}'
          ORDER BY "vote".created DESC
          OFFSET ${skip}
          LIMIT ${take};
        `;
      return prismaWeb3Client.$queryRawUnsafe<SnapshotVotePayload[]>(query);
    };

    const { meta, data: votes } = await paginateResult(
      queryFunction,
      pagination
    );

    if (!votes || votes.length === 0) {
      return {
        meta,
        data: [],
      };
    } else {
      return {
        meta,
        data: votes.map((vote) => parseSnapshotVote(vote)),
      };
    }
  });
}

/**
 * Build the has_voted CTE query based on voter type and namespace
 */
function buildHasVotedQuery(
  namespace: string,
  eventsViewName: string,
  slug: string,
  type: VoterTypes["type"],
  offchainProposalId?: string
): string {
  const isTokenHouse = type === "TH";

  if (isTokenHouse) {
    // Token House: Check onchain votes and snapshot votes
    return `
      SELECT voter FROM ${namespace}.vote_cast_events WHERE proposal_id = $1 and contract = $3
      UNION ALL
      SELECT voter FROM ${namespace}.${eventsViewName} WHERE proposal_id = $1 and contract = $3
      UNION ALL
      SELECT voter FROM "snapshot".votes WHERE proposal_id = $1 and dao_slug = '${slug}'`;
  }

  return `SELECT LOWER("voter") as voter FROM atlas."votes_with_meta_mat" WHERE "proposal_id" = ${offchainProposalId ? "$6" : "$1"}`;
}

/**
 * Get the citizen type filter based on the voter type
 */
function getCitizenTypeFilter(type: VoterTypes["type"]): string {
  switch (type) {
    case "APP":
      return "citizen_type = 'app'";
    case "CHAIN":
      return "citizen_type = 'chain'";
    case "USER":
      return "citizen_type = 'user'";
    default:
      return "citizen_type IN ('app', 'chain', 'user')";
  }
}

/**
 * Build the relevant_delegates CTE query based on voter type
 */
function buildRelevantDelegatesQuery(
  namespace: string,
  type: VoterTypes["type"]
): string {
  const isTokenHouse = type === "TH";

  if (isTokenHouse) {
    return `SELECT delegate, voting_power, NULL::text as citizen_type, NULL::text as voter_metadata_text FROM ${namespace}.delegates where contract = $2`;
  }

  const citizenTypeFilter = getCitizenTypeFilter(type);
  return `
      SELECT 
        c."address" as delegate, 
        1 as voting_power, 
        citizen_type,
        voter_metadata_text
      FROM atlas.citizens_mat c
      WHERE ${citizenTypeFilter}`;
}

async function getVotersWhoHaveNotVotedForProposal({
  proposalId,
  pagination = { offset: 0, limit: 20 },
  offchainProposalId,
  type = "TH",
}: {
  proposalId: string;
  pagination?: PaginationParams;
  offchainProposalId?: string;
  type?: VoterTypes["type"];
}) {
  return withMetrics("getVotersWhoHaveNotVotedForProposal", async () => {
    const { namespace, contracts, slug } = Tenant.current();

    const eventsViewName =
      namespace === TENANT_NAMESPACES.OPTIMISM
        ? "vote_cast_with_params_events_v2"
        : "vote_cast_with_params_events";

    const queryFunction = (skip: number, take: number) => {
      const hasVotedQuery = buildHasVotedQuery(
        namespace,
        eventsViewName,
        slug,
        type,
        offchainProposalId
      );
      const relevantDelegatesQuery = buildRelevantDelegatesQuery(
        namespace,
        type
      );

      const notVotedQuery = `
        WITH has_voted AS (
          ${hasVotedQuery}
        ),
        relevant_delegates AS (
          ${relevantDelegatesQuery}
        ),
        delegates_who_havent_votes AS (
          SELECT d.delegate, d.voting_power, d.citizen_type, d.voter_metadata_text 
          FROM relevant_delegates d 
          LEFT JOIN has_voted v ON d.delegate = v.voter 
          WHERE v.voter IS NULL
        ),
        unique_delegates AS (
          SELECT DISTINCT ON (del.delegate)
            del.delegate, 
            del.voting_power, 
            del.citizen_type, 
            del.voter_metadata_text,
            ds.twitter,
            ds.discord,
            ds.warpcast
          FROM delegates_who_havent_votes del 
          LEFT JOIN agora.delegate_statements ds ON 
            del.delegate = ds.address
            AND ds.dao_slug = 'OP'
          ORDER BY del.delegate, del.voting_power DESC
        )
        SELECT 
          delegate, 
          voting_power, 
          citizen_type, 
          voter_metadata_text::json as "voterMetadata",
          twitter,
          discord,
          warpcast
        FROM unique_delegates
        ORDER BY voting_power DESC
        OFFSET $4 LIMIT $5`;

      const params = [
        proposalId,
        contracts.token.address.toLowerCase(),
        contracts.governor.address.toLowerCase(),
        skip,
        take,
      ];

      // Add offchain proposal ID parameter if needed for citizen votes
      const shouldIncludeCitizenVotes =
        namespace === TENANT_NAMESPACES.OPTIMISM && type !== "TH";
      if (shouldIncludeCitizenVotes && offchainProposalId) {
        params.push(offchainProposalId);
      }

      return prismaWeb3Client.$queryRawUnsafe<VotePayload[]>(
        notVotedQuery,
        ...params
      );
    };

    const { meta, data: nonVoters } = await doInSpan(
      { name: "getVotersWhoHaveNotVotedForProposal" },
      async () => paginateResult(queryFunction, pagination)
    );

    if (!nonVoters || nonVoters.length === 0) {
      return {
        meta,
        data: [],
      };
    }

    return {
      meta,
      data: nonVoters,
    };
  });
}

async function getSnapshotVotesForProposal({
  proposalId,
  pagination = { offset: 0, limit: 20 },
  sort = "vp",
}: {
  proposalId: string;
  pagination?: PaginationParams;
  sort?: string;
}) {
  const { slug } = Tenant.current();

  const queryFunction = (skip: number, take: number) => {
    const query = `
      SELECT * FROM "snapshot".votes WHERE proposal_id = $1 AND dao_slug = '${slug}'
      ORDER BY ${sort} DESC
      OFFSET $2 LIMIT $3;`;

    return prismaWeb3Client.$queryRawUnsafe<SnapshotVotePayload[]>(
      query,
      proposalId,
      skip,
      take
    );
  };

  const { meta, data: votes } = await paginateResult(queryFunction, pagination);

  return { meta, data: votes.map((vote) => parseSnapshotVote(vote)) };
}

async function getVotesForProposal({
  proposalId,
  pagination = { offset: 0, limit: 20 },
  sort = "weight",
  offchainProposalId,
}: {
  proposalId: string;
  pagination?: PaginationParams;
  sort?: VotesSort;
  offchainProposalId?: string;
}): Promise<PaginatedResult<Vote[]>> {
  return withMetrics(
    "getVotesForProposal",
    async () => {
      const { namespace, contracts, ui, slug } = Tenant.current();

      let eventsViewName;

      if (namespace == TENANT_NAMESPACES.OPTIMISM) {
        eventsViewName = "vote_cast_with_params_events_v2";
      } else {
        eventsViewName = "vote_cast_with_params_events";
      }

      const includeCitizens = namespace === TENANT_NAMESPACES.OPTIMISM;
      const queryFunction = (skip: number, take: number) => {
        let citizenQuery = "";

        if (includeCitizens) {
          citizenQuery = `
            UNION ALL
            SELECT
              transaction_hash,
              proposal_id,
              voter,
              support::text,
              weight,
              reason,
              params,
              block_number,
              citizen_type::text,
              CASE
                WHEN EXISTS (
                  SELECT 1
                  FROM agora.delegate_statements ds
                  WHERE ds.address = ocv.voter
                  AND ds.dao_slug = '${slug}'::config.dao_slug
                ) THEN NULL
                ELSE voter_metadata::json
              END as voter_metadata
            FROM atlas."votes_with_meta_mat" ocv
            WHERE ocv.proposal_id = ${offchainProposalId ? "$5" : "$1"}
          `;
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
            citizen_type,
            voter_metadata,
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
              params,
              citizen_type,
              MAX(voter_metadata::text)::json as voter_metadata
            FROM (
              SELECT
                transaction_hash,
                proposal_id,
                voter,
                support,
                weight::numeric,
                reason,
                params,
                block_number,
                NULL::text as citizen_type,
                NULL::json as voter_metadata
              FROM ${namespace}.vote_cast_events
              WHERE proposal_id = $1 AND contract = $2
              UNION ALL
              SELECT
                transaction_hash,
                proposal_id,
                voter,
                support,
                weight::numeric,
                reason,
                params,
                block_number,
                NULL::text as citizen_type,
                NULL::json as voter_metadata
              FROM ${namespace}.${eventsViewName}
              WHERE proposal_id = $1 AND contract = $2
              ${includeCitizens ? citizenQuery : ""}
            ) t
            GROUP BY 2,3,4,8,9
            ) av
            LEFT JOIN LATERAL (
              SELECT
                proposals.description,
                proposals.proposal_data,
                proposals.proposal_type AS proposal_type
              FROM ${namespace}.proposals_v2 proposals
              WHERE proposals.proposal_id = $1 AND proposals.contract = $2) p ON TRUE
          ) q
          ORDER BY citizen_type IS NOT NULL DESC, ${sort} DESC
          OFFSET $3
          LIMIT $4;`;

        const params = [
          proposalId,
          contracts.governor.address.toLowerCase(),
          skip,
          take,
        ];

        if (includeCitizens && offchainProposalId) {
          params.push(offchainProposalId);
        }

        return prismaWeb3Client.$queryRawUnsafe<VotePayload[]>(
          query,
          ...params
        );
      };

      const latestBlockPromise: Promise<Block> = ui.toggle(
        "use-l1-block-number"
      )?.enabled
        ? contracts.providerForTime?.getBlock("latest")
        : contracts.token.provider.getBlock("latest");

      const [{ meta, data: votes }, latestBlock] = await Promise.all([
        doInSpan({ name: "getVotesForProposal" }, async () =>
          paginateResult(queryFunction, pagination)
        ),
        latestBlockPromise,
      ]);

      if (!votes || votes.length === 0) {
        return {
          meta,
          data: [],
        };
      }

      let proposalData: ParsedProposalData[ProposalType] | undefined =
        undefined;
      try {
        proposalData = parseProposalData(
          JSON.stringify(votes[0]?.proposal_data || {}),
          votes[0]?.proposal_type
        );
      } catch (error) {
        console.error("Error parsing proposal data", error);
      }

      const data = await Promise.all(
        votes.map((vote) => parseVote(vote, proposalData, latestBlock))
      );

      return {
        meta,
        data,
      };
    },
    { sort }
  );
}

async function getUserSnapshotVotesForProposal({
  proposalId,
  address,
}: {
  proposalId: string;
  address: string;
}) {
  const { slug } = Tenant.current();

  const queryFunction = prismaWeb3Client.$queryRawUnsafe<SnapshotVotePayload[]>(
    `
      SELECT * FROM "snapshot".votes WHERE proposal_id = $1 AND dao_slug = '${slug}' AND voter = $2`,
    proposalId,
    address.toLowerCase()
  );

  const votes = await doInSpan(
    { name: "getUserSnapshotVotesForProposal" },
    async () => queryFunction
  );

  const data = Promise.all(votes.map((vote) => parseSnapshotVote(vote)));

  return data;
}

async function getUserVotesForProposal({
  proposalId,
  address,
}: {
  proposalId: string;
  address: string;
}) {
  return withMetrics("getUserVotesForProposal", async () => {
    const { namespace, contracts, ui } = Tenant.current();
    const queryFunciton = prismaWeb3Client.$queryRawUnsafe<VotePayload[]>(
      `
      SELECT
        STRING_AGG(transaction_hash,'|') as transaction_hash,
        proposal_id,
        proposal_type,
        proposal_data,
        voter,
        support,
        SUM(weight::numeric) as weight,
        STRING_AGG(distinct reason, '\n --------- \n') as reason,
        MAX(block_number) as block_number,
        params
      FROM ${namespace + ".votes"}
      WHERE proposal_id = $1AND voter = $2
      GROUP BY proposal_id, proposal_type, proposal_data, voter, support, params
      `,
      proposalId,
      address.toLowerCase()
    );

    const votes = await doInSpan(
      { name: "getUserVotesForProposal" },
      async () => queryFunciton
    );

    const latestBlock = ui.toggle("use-l1-block-number")?.enabled
      ? await contracts.providerForTime?.getBlock("latest")
      : await contracts.token.provider.getBlock("latest");

    const data = Promise.all(
      votes.map((vote) => {
        let proposalData: ParsedProposalData[ProposalType] | undefined =
          undefined;
        try {
          proposalData = parseProposalData(
            JSON.stringify(vote.proposal_data || {}),
            vote.proposal_type
          );
        } catch (error) {
          console.error("Error parsing proposal data", error);
        }
        return parseVote(vote, proposalData, latestBlock);
      })
    );

    return data;
  });
}

async function getVotesForProposalAndDelegate({
  proposalId,
  address,
}: {
  proposalId: string;
  address: string;
}) {
  return withMetrics("getVotesForProposalAndDelegate", async () => {
    const { namespace, contracts, ui } = Tenant.current();
    const votes = await findVotes({
      namespace,
      proposalId,
      voter: address.toLowerCase(),
    });

    const latestBlock = ui.toggle("use-l1-block-number")?.enabled
      ? await contracts.providerForTime?.getBlock("latest")
      : await contracts.token.provider.getBlock("latest");

    const data = await Promise.all(
      votes.map((vote: VotePayload) =>
        parseVote(
          vote,
          parseProposalData(
            JSON.stringify(vote.proposal_data || {}),
            vote.proposal_type
          ),
          latestBlock
        )
      )
    );

    return data;
  });
}

export const fetchVotesForDelegate = cache(getVotesForDelegate);
export const fetchSnapshotVotesForDelegate = cache(getSnapshotVotesForDelegate);
export const fetchVotesForProposal = cache(getVotesForProposal);
export const fetchUserVotesForProposal = cache(getUserVotesForProposal);
export const fetchVotesForProposalAndDelegate = cache(
  getVotesForProposalAndDelegate
);
export const fetchVotersWhoHaveNotVotedForProposal = cache(
  getVotersWhoHaveNotVotedForProposal
);
export const fetchVotesForProposalAndDelegateUnstableCache = unstable_cache(
  getVotesForProposalAndDelegate,
  [],
  {
    tags: ["votesForProposalAndDelegate"],
    revalidate: 86400, // 1 day
  }
);
export const fetchSnapshotVotesForProposal = cache(getSnapshotVotesForProposal);
export const fetchSnapshotUserVotesForProposal = cache(
  getUserSnapshotVotesForProposal
);

// Count distinct proposals a delegate has voted on (DB), used for archive participation rate
async function getVotesCountForDelegateForAddress({
  address,
}: {
  address: string;
}) {
  return withMetrics("getVotesCountForDelegateForAddress", async () => {
    const { namespace, contracts } = Tenant.current();

    // Count distinct proposals the delegate has voted on via votes table
    const query = `
      SELECT COUNT(DISTINCT v.proposal_id)::int AS count
      FROM ${namespace}.votes v
      WHERE v.voter = $1
        AND v.contract = $2
    `;

    const rows = await prismaWeb3Client.$queryRawUnsafe<{ count: number }[]>(
      query,
      address.toLowerCase(),
      contracts.governor.address.toLowerCase()
    );

    const count = rows?.[0]?.count ?? 0;
    return count as number;
  });
}

export const fetchVotesCountForDelegate = cache(
  getVotesCountForDelegateForAddress
);
