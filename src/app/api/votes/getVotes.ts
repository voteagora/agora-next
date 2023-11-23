import { paginatePrismaResult } from "@/app/lib/pagination";
import { resolveENSName } from "@/app/lib/utils";
import { parseProposalData } from "@/lib/proposalUtils";
import { parseVote } from "@/lib/voteUtils";
import { isAddress } from "viem";
import { VotesSort, VotesSortOrder } from "./vote";

export async function getVotesForDelegate({
  addressOrENSName,
  page = 1,
  sort = "block_number",
  sortOrder = "desc",
}: {
  addressOrENSName: string;
  page: number;
  sort: VotesSort;
  sortOrder: VotesSortOrder;
}) {
  const pageSize = 25;
  const address = isAddress(addressOrENSName)
    ? addressOrENSName.toLowerCase()
    : await resolveENSName(addressOrENSName);

  const { meta, data: votes } = await paginatePrismaResult(
    (skip: number, take: number) =>
      prisma.votes.findMany({
        where: { voter: address },
        take,
        skip,
        orderBy: {
          [sort]: sortOrder,
        },
      }),
    page,
    pageSize
  );

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
