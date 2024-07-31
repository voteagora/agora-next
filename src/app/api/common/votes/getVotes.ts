import {
  PaginatedResult,
  paginateResult,
  PaginationParams,
} from "@/app/lib/pagination";
import { parseProposalData } from "@/lib/proposalUtils";
import { parseSnapshotVote, parseVote } from "@/lib/voteUtils";
import { cache } from "react";
import {
  SnapshotVote,
  SnapshotVotePayload,
  Vote,
  VotePayload,
  VotesSort,
} from "./vote";
import prisma from "@/app/lib/prisma";
import { addressOrEnsNameWrap } from "../utils/ensName";
import Tenant from "@/lib/tenant/tenant";
import { doInSpan } from "@/app/lib/logging";

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
  const { namespace, contracts } = Tenant.current();

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
          start_block,
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
            SUM(weight::numeric) as weight,
            STRING_AGG(distinct reason, '\n --------- \n') as reason,
            MAX(block_number) as block_number,
            params,
            contract
          FROM (
            SELECT
              *
              FROM ${namespace + ".vote_cast_events"}
              WHERE voter = $1 AND contract = $2
            UNION ALL
              SELECT
                *
              FROM ${namespace + ".vote_cast_with_params_events"}
              WHERE voter = $1 AND contract = $2
          ) t
          GROUP BY 2,3,4,8,9
          ) av
          LEFT JOIN LATERAL (
            SELECT
              proposals.start_block,
              proposals.description,
              proposals.proposal_data,
              proposals.proposal_type::config.proposal_type AS proposal_type
            FROM
              ${namespace + ".proposals"} proposals
            WHERE
              proposals.proposal_id = av.proposal_id AND proposals.contract = av.contract) p ON TRUE
        ) q
        ORDER BY block_number DESC
        OFFSET $3
        LIMIT $4;
        `;
    return prisma.$queryRawUnsafe<VotePayload[]>(
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

  const latestBlock = await contracts.token.provider.getBlock("latest");

  return {
    meta,
    data: votes.map((vote) => {
      const proposalData = parseProposalData(
        JSON.stringify(vote.proposal_data || {}),
        vote.proposal_type
      );
      return parseVote(vote, proposalData, latestBlock);
    }),
  };
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
    return prisma.$queryRawUnsafe<SnapshotVotePayload[]>(query, skip, take);
  };

  const { meta, data: votes } = await paginateResult(queryFunction, pagination);

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
  const { namespace, contracts } = Tenant.current();

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
        start_block,
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
          SUM(weight::numeric) as weight,
          STRING_AGG(distinct reason, '\n --------- \n') as reason,
          MAX(block_number) as block_number,
          params,
          contract
        FROM (
          SELECT
            *
          FROM ${namespace + ".vote_cast_events"}
          WHERE proposal_id = $1 AND contract = $2
          UNION ALL
          SELECT
            *
          FROM ${namespace + ".vote_cast_with_params_events"}
          WHERE proposal_id = $1 AND contract = $2
        ) t
        GROUP BY 2,3,4,8,9
        ) av
        LEFT JOIN LATERAL (
          SELECT
            proposals.start_block,
            proposals.description,
            proposals.proposal_data,
            proposals.proposal_type::config.proposal_type AS proposal_type
          FROM ${namespace + ".proposals"} proposals
          WHERE proposals.proposal_id = $1 AND proposals.contract = av.contract) p ON TRUE
      ) q
      ORDER BY ${sort} DESC
      OFFSET $3
      LIMIT $4;
    `;
    return prisma.$queryRawUnsafe<VotePayload[]>(
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
    contracts.token.provider.getBlock("latest"),
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

  return {
    meta,
    data: votes.map((vote) => parseVote(vote, proposalData, latestBlock)),
  };
}

async function getUserVotesForProposal({
  proposalId,
  address,
}: {
  proposalId: string;
  address: string;
}) {
  const { namespace, contracts } = Tenant.current();
  const queryFunciton = prisma.$queryRawUnsafe<VotePayload[]>(
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

  const latestBlock = await contracts.token.provider.getBlock("latest");

  return votes.map((vote) =>
    parseVote(
      vote,
      parseProposalData(
        JSON.stringify(vote.proposal_data || {}),
        vote.proposal_type
      ),
      latestBlock
    )
  );
}

async function getVotesForProposalAndDelegate({
  proposalId,
  address,
}: {
  proposalId: string;
  address: string;
}) {
  const { namespace, contracts } = Tenant.current();
  const votes = await prisma[`${namespace}Votes`].findMany({
    where: { proposal_id: proposalId, voter: address?.toLowerCase() },
  });

  const latestBlock = await contracts.token.provider.getBlock("latest");

  return votes.map((vote: VotePayload) =>
    parseVote(
      vote,
      parseProposalData(
        JSON.stringify(vote.proposal_data || {}),
        vote.proposal_type
      ),
      latestBlock
    )
  );
}

export const fetchVotesForDelegate = cache(getVotesForDelegate);
export const fetchSnapshotVotesForDelegate = cache(getSnapshotVotesForDelegate);
export const fetchVotesForProposal = cache(getVotesForProposal);
export const fetchUserVotesForProposal = cache(getUserVotesForProposal);
export const fetchVotesForProposalAndDelegate = cache(
  getVotesForProposalAndDelegate
);
