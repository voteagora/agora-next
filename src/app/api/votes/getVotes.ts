import { paginatePrismaResult } from "@/app/lib/pagination";
import { parseProposalData } from "@/lib/proposalUtils";
import { parseVote } from "@/lib/voteUtils";
import { VotesSort, VotesSortOrder } from "./vote";
import prisma from "@/app/lib/prisma";
import provider from "@/app/lib/provider";
import { addressOrEnsNameWrap } from "../utils/ensName";
import { Prisma } from "@prisma/client";

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
}) => addressOrEnsNameWrap(getVotesForDelegateForAddress, addressOrENSName, { page, sort, sortOrder });

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
      prisma.$queryRaw<Prisma.VotesGetPayload<true>[]>(
        Prisma.sql`
        SELECT * FROM (
          SELECT * FROM (
            SELECT
              *
              FROM center.vote_cast_events
              WHERE voter = ${address.toLocaleLowerCase()}
            UNION ALL
              SELECT
                *
              FROM
                center.vote_cast_with_params_events
                WHERE voter = ${address.toLocaleLowerCase()}
          ) t
          LEFT JOIN LATERAL (
            SELECT
              proposals_mat.start_block,
              proposals_mat.description,
              proposals_mat.proposal_data,
              proposals_mat.proposal_type::center.proposal_type AS proposal_type
            FROM
              center.proposals_mat
            WHERE
              proposals_mat.proposal_id = t.proposal_id) p ON TRUE
        ) q
        ORDER BY block_number DESC
        OFFSET ${skip}
        LIMIT ${take};
      `
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
  sort = "block_number",
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
      prisma.$queryRaw<Prisma.VotesGetPayload<true>[]>(
        Prisma.sql`
        SELECT * FROM (
          SELECT * FROM (
            SELECT
              *
              FROM center.vote_cast_events
              WHERE proposal_id = ${proposal_id}
            UNION ALL
              SELECT
                *
              FROM
                center.vote_cast_with_params_events
                WHERE proposal_id = ${proposal_id}
          ) t
          LEFT JOIN LATERAL (
            SELECT
              proposals_mat.start_block,
              proposals_mat.description,
              proposals_mat.proposal_data,
              proposals_mat.proposal_type::center.proposal_type AS proposal_type
            FROM
              center.proposals_mat
            WHERE
              proposals_mat.proposal_id = ${proposal_id} AND
              proposals_mat.proposal_id = t.proposal_id) p ON TRUE
        ) q
        ORDER BY weight::NUMERIC DESC
        OFFSET ${skip}
        LIMIT ${take};
      `
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

export async function getVoteForProposalAndDelegate({
  proposal_id,
  address,
}: {
  proposal_id: string;
  address: string;
}) {
  const vote = await prisma.votes.findFirst({
    where: { proposal_id, voter: address?.toLowerCase() },
  });

  if (!vote) {
    return {
      vote: undefined,
    };
  }

  const latestBlock = await provider.getBlock("latest");
  const proposalData = parseProposalData(
    JSON.stringify(vote.proposal_data || {}),
    vote.proposal_type
  );

  return {
    vote: parseVote(vote, proposalData, latestBlock),
  };
}
