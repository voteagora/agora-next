import { paginatePrismaResult } from "@/app/lib/pagination";
import { parseProposalData } from "@/lib/proposalUtils";
import { parseVote } from "@/lib/voteUtils";
import { VotePayload, VotesSort, VotesSortOrder } from "./vote";
import prisma from "@/app/lib/prisma";
import provider from "@/app/lib/provider";
import { addressOrEnsNameWrap } from "../utils/ensName";
import { getVotingPowerAtSnapshot } from "../voting-power/getVotingPower";
import { getAuthorityChains } from "../authority-chains/getAuthorityChains";
import { getDelegate } from "../delegates/getDelegates";
import { DEPLOYMENT_NAME } from "@/lib/config";

export const getVotesForDelegate = ({
  addressOrENSName,
  page,
  sort,
  sortOrder,
}: {
  addressOrENSName: string;
  page: number;
  sort: VotesSort | undefined;
  sortOrder: VotesSortOrder | undefined;
}) =>
  addressOrEnsNameWrap(getVotesForDelegateForAddress, addressOrENSName, {
    page,
    sort,
    sortOrder,
  });

async function getVotesForDelegateForAddress({
  address,
  page = 1,
  sort = "block_number",
  sortOrder = "desc",
}: {
  address: string;
  page: number;
  sort: VotesSort | undefined;
  sortOrder: VotesSortOrder | undefined;
}) {
  const pageSize = 10;

  const { meta, data: votes } = await paginatePrismaResult(
    (skip: number, take: number) =>
      prisma.$queryRawUnsafe<VotePayload[]>(
        `
        SELECT * FROM (
          SELECT * FROM (
          SELECT 
            STRING_AGG(transaction_hash,'|') as transaction_hash,
            proposal_id,
            voter,
            support,
            SUM(weight::numeric) as weight,
            STRING_AGG(distinct reason, '\n --------- \n') as reason,
            MAX(block_number) as block_number,
            params 
          FROM (
            SELECT
              *
              FROM ${DEPLOYMENT_NAME + ".vote_cast_events"}
              WHERE voter = $1
            UNION ALL
              SELECT
                *
              FROM ${DEPLOYMENT_NAME + ".vote_cast_with_params_events"}
              WHERE voter = $1
          ) t
          GROUP BY 2,3,4,8
          ) av
          LEFT JOIN LATERAL (
            SELECT
              proposals_mat.start_block,
              proposals_mat.description,
              proposals_mat.proposal_data,
              proposals_mat.proposal_type::config.proposal_type AS proposal_type
            FROM
              ${DEPLOYMENT_NAME + ".proposals_mat"} proposals_mat
            WHERE
              proposals_mat.proposal_id = av.proposal_id) p ON TRUE
        ) q
        ORDER BY block_number DESC
        OFFSET $2
        LIMIT $3;
      `,
        address.toLocaleLowerCase(),
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

  const latestBlock = await provider.getBlock("latest");

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

export async function getVotesForProposal({
  proposal_id,
  page = 1,
  sort = "weight",
  sortOrder = "desc",
}: {
  proposal_id: string;
  page?: number;
  sort?: VotesSort;
  sortOrder?: VotesSortOrder;
}) {
  const pageSize = 50;

  const { meta, data: votes } = await paginatePrismaResult(
    (skip: number, take: number) =>
      prisma.$queryRawUnsafe<VotePayload[]>(
        `
        SELECT * FROM (
          SELECT * FROM (
          SELECT 
            STRING_AGG(transaction_hash,'|') as transaction_hash,
            proposal_id,
            voter,
            support,
            SUM(weight::numeric) as weight,
            STRING_AGG(distinct reason, '\n --------- \n') as reason,
            MAX(block_number) as block_number,
            params
          FROM (
            SELECT
              *
            FROM ${DEPLOYMENT_NAME + ".vote_cast_events"}
            WHERE proposal_id = $1
            UNION ALL
            SELECT
              *
            FROM ${DEPLOYMENT_NAME + ".vote_cast_with_params_events"}
            WHERE proposal_id = $1
          ) t
          GROUP BY 2,3,4,8
          ) av
          LEFT JOIN LATERAL (
            SELECT
              proposals_mat.start_block,
              proposals_mat.description,
              proposals_mat.proposal_data,
              proposals_mat.proposal_type::config.proposal_type AS proposal_type
            FROM ${DEPLOYMENT_NAME + ".proposals_mat"} proposals_mat
            WHERE proposals_mat.proposal_id = $1) p ON TRUE
        ) q
        ORDER BY ${sort} DESC
        OFFSET $2
        LIMIT $3;
      `,
        proposal_id,
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

  const latestBlock = await provider.getBlock("latest");
  const proposalData = parseProposalData(
    JSON.stringify(votes[0]?.proposal_data || {}),
    votes[0]?.proposal_type
  );

  return {
    meta,
    votes: votes.map((vote) => parseVote(vote, proposalData, latestBlock)),
  };
}

export async function getVotesForProposalAndDelegate({
  proposal_id,
  address,
}: {
  proposal_id: string;
  address: string;
}) {
  const votes = await prisma[`${DEPLOYMENT_NAME}Votes`].findMany({
    where: { proposal_id, voter: address?.toLowerCase() },
  });

  const latestBlock = await provider.getBlock("latest");

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

export async function getAllForVoting(
  address: string | `0x${string}`,
  blockNumber: number,
  proposal_id: string
) {
  const [votingPower, authorityChains, delegate, votesForProposalAndDelegate] =
    await Promise.all([
      getVotingPowerAtSnapshot({ addressOrENSName: address, blockNumber }),
      getAuthorityChains({ address, blockNumber }),
      getDelegate({ addressOrENSName: address }),
      getVotesForProposalAndDelegate({ proposal_id, address }),
    ]);

  return {
    votingPower,
    authorityChains,
    delegate,
    votesForProposalAndDelegate,
  };
}
