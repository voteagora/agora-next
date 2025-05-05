import {
  PaginatedResult,
  paginateResult,
  PaginationParams,
} from "@/app/lib/pagination";
import {
  getProposalTotalValue,
  getTitleFromProposalDescription,
  parseProposalData,
} from "@/lib/proposalUtils";
import { parseSnapshotVote, parseSupport, parseVote } from "@/lib/voteUtils";
import { cache } from "react";
import {
  SnapshotVote,
  SnapshotVotePayload,
  Vote,
  VotePayload,
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
import {
  adaptDAONodeResponse,
  getProposalFromDaoNode,
} from "@/app/lib/dao-node/client";
import { getHumanBlockTime } from "@/lib/blockTimes";

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

    const data = await Promise.all(
      votes.map((vote) => {
        const proposalData = parseProposalData(
          JSON.stringify(vote.proposal_data || {}),
          vote.proposal_type
        );
        return parseVote(vote, proposalData, latestBlock);
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
      return prismaWeb3Client.$queryRawUnsafe<SnapshotVotePayload[]>(
        query,
        skip,
        take
      );
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

async function getVotersWhoHaveNotVotedForProposal({
  proposalId,
  pagination = { offset: 0, limit: 20 },
}: {
  proposalId: string;
  pagination?: PaginationParams;
}) {
  return withMetrics("getVotersWhoHaveNotVotedForProposal", async () => {
    const { namespace, contracts, slug } = Tenant.current();

    let eventsViewName;

    if (namespace == TENANT_NAMESPACES.OPTIMISM) {
      eventsViewName = "vote_cast_with_params_events_v2";
    } else {
      eventsViewName = "vote_cast_with_params_events";
    }

    const queryFunction = (skip: number, take: number) => {
      const notVotedQuery = `
              with has_voted as (
                  SELECT voter FROM ${namespace}.vote_cast_events WHERE proposal_id = $1 and contract = $3
                  UNION ALL
                  SELECT voter FROM ${namespace}.${eventsViewName} WHERE proposal_id = $1 and contract = $3
                  UNION ALL
                  SELECT voter FROM "snapshot".votes WHERE proposal_id = $1 and dao_slug = '${slug}'
                ),
                relevant_delegates as (
                  SELECT * FROM ${namespace}.delegates where contract = $2
                ),
                delegates_who_havent_votes as (
                  SELECT * FROM relevant_delegates d left join has_voted v on d.delegate = v.voter where v.voter is null
                )
                select del.*,
                      ds.twitter,
                    ds.discord,
                    ds.warpcast
                from delegates_who_havent_votes del LEFT JOIN agora.delegate_statements ds on 
                  del.delegate = ds.address
                  AND ds.dao_slug = 'OP'
                ORDER BY del.voting_power DESC
                OFFSET $4 LIMIT $5;`;

      return prismaWeb3Client.$queryRawUnsafe<VotePayload[]>(
        notVotedQuery,
        proposalId,
        contracts.token.address.toLowerCase(),
        contracts.governor.address.toLowerCase(),
        skip,
        take
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
}: {
  proposalId: string;
  pagination?: PaginationParams;
  sort?: VotesSort;
}): Promise<PaginatedResult<Vote[]>> {
  return withMetrics(
    "getVotesForProposal",
    async () => {
      const { namespace, contracts, ui } = Tenant.current();
      const useDaoNode = ui.toggle("dao-node/proposal-votes")?.enabled ?? false;

      const latestBlockPromise: Promise<Block> = ui.toggle(
        "use-l1-block-number"
      )?.enabled
        ? contracts.providerForTime?.getBlock("latest")
        : contracts.token.provider.getBlock("latest");

      if (useDaoNode) {
        try {
          const proposal = (await getProposalFromDaoNode(proposalId)).proposal;
          if (!proposal) {
            // Will be caught and ignored below and move on to DB fallback
            throw new Error("Proposal not found");
          }
          const parsedProposal = adaptDAONodeResponse(proposal);
          const latestBlock = await latestBlockPromise;
          const votes = proposal.voting_record
            ?.map((vote) => {
              return {
                transactionHash: null,
                address: vote.voter,
                proposalId,
                support: parseSupport(
                  String(vote.support),
                  parsedProposal.proposal_type,
                  String(proposal.start_block)
                ),
                weight: vote.votes.toString(),
                reason: vote.reason,
                params: [],
                proposalValue:
                  getProposalTotalValue(parsedProposal.proposal_data) ??
                  BigInt(0),
                proposalTitle: getTitleFromProposalDescription(
                  proposal.description
                ),
                proposalType: parsedProposal.proposal_type,
                timestamp: getHumanBlockTime(vote.block_number, latestBlock),
                blockNumber: BigInt(vote.block_number),
                transaction_index: vote.transaction_index,
              };
            })
            .sort((a, b) => Number(b.weight) - Number(a.weight));
          return {
            meta: {
              has_next: false,
              total_returned: votes.length,
              next_offset: 0,
            },
            data: votes,
          };
        } catch (error) {
          // skip error
        }
      }

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
                params,
                block_number
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
                block_number
              FROM ${namespace}.${eventsViewName}
              WHERE proposal_id = $1 AND contract = $2
            ) t
            GROUP BY 2,3,4,8
            ) av
            LEFT JOIN LATERAL (
              SELECT
                proposals.description,
                proposals.proposal_data,
                proposals.proposal_type::config.proposal_type AS proposal_type
              FROM ${namespace}.proposals_v2 proposals
              WHERE proposals.proposal_id = $1 AND proposals.contract = $2) p ON TRUE
          ) q
          ORDER BY ${sort} DESC
          OFFSET $3
          LIMIT $4;`;

        return prismaWeb3Client.$queryRawUnsafe<VotePayload[]>(
          query,
          proposalId,
          contracts.governor.address.toLowerCase(),
          skip,
          take
        );
      };

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

      const proposalData = parseProposalData(
        JSON.stringify(votes[0]?.proposal_data || {}),
        votes[0]?.proposal_type
      );

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
    const useDaoNode = ui.toggle("dao-node/proposal-votes")?.enabled ?? false;

    const latestBlock = ui.toggle("use-l1-block-number")?.enabled
      ? await contracts.providerForTime?.getBlock("latest")
      : await contracts.token.provider.getBlock("latest");

    if (useDaoNode) {
      try {
        const proposal = (await getProposalFromDaoNode(proposalId)).proposal;
        if (!proposal) {
          // Will be caught and ignored below and move on to DB fallback
          throw new Error("Proposal not found");
        }
        const parsedProposal = adaptDAONodeResponse(proposal);
        const votes = proposal.voting_record
          ?.filter((vote) => vote.voter === address.toLowerCase())
          .map((vote) => {
            return {
              transactionHash: null,
              address: vote.voter,
              proposalId,
              support: parseSupport(
                String(vote.support),
                parsedProposal.proposal_type,
                String(proposal.start_block)
              ),
              weight: vote.votes.toString(),
              reason: vote.reason,
              params: [],
              proposalValue:
                getProposalTotalValue(parsedProposal.proposal_data) ??
                BigInt(0),
              proposalTitle: getTitleFromProposalDescription(
                proposal.description
              ),
              proposalType: parsedProposal.proposal_type,
              timestamp: getHumanBlockTime(vote.block_number, latestBlock),
              blockNumber: BigInt(vote.block_number),
              transaction_index: vote.transaction_index,
            };
          });
        return votes;
      } catch (error) {
        // skip error
      }
    }

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

    const data = Promise.all(
      votes.map((vote) =>
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
