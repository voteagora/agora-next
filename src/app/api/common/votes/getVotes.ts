import { PaginatedResult, paginateResult } from "@/app/lib/pagination";
import { parseProposalData } from "@/lib/proposalUtils";
import { parseVote } from "@/lib/voteUtils";
import { cache } from "react";
import { Vote, VotePayload, VotesSort } from "./vote";
import prisma from "@/app/lib/prisma";
import { addressOrEnsNameWrap } from "../utils/ensName";
import Tenant from "@/lib/tenant/tenant";

const getVotesForDelegate = ({
  addressOrENSName,
  page,
}: {
  addressOrENSName: string;
  page: number;
}) =>
  addressOrEnsNameWrap(getVotesForDelegateForAddress, addressOrENSName, {
    page,
  });

async function getVotesForDelegateForAddress({
  address,
  page = 1,
}: {
  address: string;
  page: number;
}) {
  const { namespace, contracts } = Tenant.current();
  const pageSize = 10;

  const { meta, data: votes } = await paginateResult(
    (skip: number, take: number) =>
      prisma.$queryRawUnsafe<VotePayload[]>(
        `
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
      `,
        address.toLocaleLowerCase(),
        contracts.governor.address.toLowerCase(),
        skip,
        take
      ),
    page,
    pageSize
  );

  if (!votes || votes.length === 0) {
    return {
      meta,
      votes: [],
    };
  }

  const latestBlock = await contracts.token.provider.getBlock("latest");

  return {
    meta,
    votes: votes.map((vote) => {
      const proposalData = parseProposalData(
        JSON.stringify(vote.proposal_data || {}),
        vote.proposal_type
      );
      return parseVote(vote, proposalData, latestBlock);
    }),
  };
}

async function getVotesForProposal({
  proposal_id,
  page = 1,
  sort = "weight",
}: {
  proposal_id: string;
  page?: number;
  sort?: VotesSort;
}) {
  const { namespace, contracts } = Tenant.current();
  const pageSize = 50;

  const { meta, data: votes } = await paginateResult(
    (skip: number, take: number) =>
      prisma.$queryRawUnsafe<VotePayload[]>(
        `
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
      `,
        proposal_id,
        contracts.governor.address.toLowerCase(),
        skip,
        take
      ),
    page,
    pageSize
  );

  if (!votes || votes.length === 0) {
    return {
      meta,
      votes: [],
    };
  }

  const latestBlock = await contracts.token.provider.getBlock("latest");
  const proposalData = parseProposalData(
    JSON.stringify(votes[0]?.proposal_data || {}),
    votes[0]?.proposal_type
  );

  return {
    meta,
    votes: votes.map((vote) => parseVote(vote, proposalData, latestBlock)),
  };
}

async function getUserVotesForProposal({
  proposal_id,
  address,
}: {
  proposal_id: string;
  address: string;
}) {
  const { namespace, contracts } = Tenant.current();
  const votes = await prisma.$queryRawUnsafe<VotePayload[]>(
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
    proposal_id,
    address.toLowerCase()
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
  proposal_id,
  address,
}: {
  proposal_id: string;
  address: string;
}) {
  const { namespace, contracts } = Tenant.current();
  const votes = await prisma[`${namespace}Votes`].findMany({
    where: { proposal_id, voter: address?.toLowerCase() },
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
export const fetchVotesForProposal = cache(getVotesForProposal);
export const fetchUserVotesForProposal = cache(getUserVotesForProposal);
export const fetchVotesForProposalAndDelegate = cache(
  getVotesForProposalAndDelegate
);
