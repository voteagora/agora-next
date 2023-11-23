import { paginatePrismaResult } from "@/app/lib/pagination";
import { Prisma } from "@prisma/client";
import prisma from "@/app/lib/prisma";

import "server-only";
import { isAddress } from "viem";
import { resolveENSName } from "@/app/lib/utils";
import { getCurrentQuorum } from "@/lib/governorUtils";
import { Delegate } from "./delegate";

export async function getDelegates({
  page = 1,
  sort = "weighted_random",
  seed = Math.random(),
}: {
  page: number;
  sort: string;
  seed?: number;
}) {
  const pageSize = 20;

  const { meta, data: delegates } = await paginatePrismaResult(
    (skip: number, take: number) => {
      switch (sort) {
        case "most_delegators":
          return prisma.delegates.findMany({
            skip,
            take,
            orderBy: {
              num_for_delegators: "desc",
            },
          });
        case "weigted_random":
          return prisma.$queryRaw<Prisma.DelegatesGetPayload<true>[]>(
            Prisma.sql`
            SELECT *, setseed(${seed})::Text
            FROM center.delegates
            WHERE voting_power > 0
            ORDER BY -log(random()) / voting_power
            OFFSET ${skip}
            LIMIT ${take};
            `
          );
        default:
          return prisma.delegates.findMany({
            skip,
            take,
            orderBy: {
              voting_power: "desc",
            },
          });
      }
    },
    page,
    pageSize
  );

  return {
    meta,
    delegates: delegates.map((delegate) => ({
      address: delegate.delegate,
      votingPower: delegate.voting_power?.toFixed(),
    })),
  };
}

export async function getDelegate({
  addressOrENSName,
}: {
  addressOrENSName: string;
}): Promise<Delegate> {
  const address = isAddress(addressOrENSName)
    ? addressOrENSName.toLowerCase()
    : await resolveENSName(addressOrENSName);

  const voterStats = await prisma.voterStats.findFirst({
    where: { voter: address },
  });
  const votingPower = await prisma.votingPower.findFirst({
    where: { delegate: address },
  });
  const numOfDelegators = await prisma.numberOfDelegators.findFirst({
    where: { delegate: address },
  });

  const quorum = await getCurrentQuorum("OPTIMISM");

  // Build out delegate JSON response
  return {
    address: address,
    votingPower: votingPower?.voting_power || "0",
    votingPowerRelativeToVotableSupply:
      Number(votingPower?.relative_voting_power) || 0,
    votingPowerRelativeToQuorum:
      Number(
        (BigInt(votingPower?.voting_power || 0) * 10000n) / (quorum || 0n)
      ) / 10000,
    proposalsCreated: voterStats?.proposals_created || 0n,
    proposalsVotedOn: voterStats?.proposals_voted || 0n,
    votedFor: voterStats?.for?.toFixed() || "0",
    votedAgainst: voterStats?.against?.toFixed() || "0",
    votedAbstain: voterStats?.abstain?.toFixed() || "0",
    votingParticipation: voterStats?.participation_rate || 0,
    lastTenProps: voterStats?.last_10_props?.toFixed() || "0",
    numOfDelegators: numOfDelegators?.num_for_delegators || 0n,
  };
}
