import "server-only";

import { paginatePrismaResult } from "@/app/lib/pagination";
import { Prisma } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { isAddress } from "viem";
import { resolveENSName } from "@/app/lib/utils";
import { getDelegateStatement } from "../delegateStatement/getDelegateStatement";
import { Delegate } from "./delegate";
import { getCurrentQuorum } from "../quorum/getQuorum";
import { isCitizen } from "../citizens/isCitizen";

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
              num_of_delegators: "desc",
            },
            where: {
              num_of_delegators: {
                not: null,
              },
            },
          });
        case "weighted_random":
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

  const statements = await Promise.all(
    delegates.map((delegate) =>
      getDelegateStatement({ addressOrENSName: delegate.delegate })
    )
  );

  return {
    meta,
    delegates: delegates.map((delegate, index) => ({
      address: delegate.delegate,
      votingPower: delegate.voting_power?.toFixed(0),
      statement: statements[index],
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
  const advancedVotingPower = await prisma.advancedVotingPower.findFirst({
    where: { delegate: address },
  });

  const totalVotingPower =
    BigInt(votingPower?.voting_power || 0) +
    BigInt(advancedVotingPower?.advanced_vp.toFixed(0) || 0);

  const votableSupply =
    (await prisma.votableSupply.findFirst({}))?.votable_supply || 1n;

  const numOfDelegators = await prisma.numberOfDelegators.findFirst({
    where: { delegate: address },
  });

  const delegateStatement = await getDelegateStatement({ addressOrENSName });

  const quorum = await getCurrentQuorum();

  const _isCitizen = await isCitizen(address);

  // Build out delegate JSON response
  return {
    address: address,
    // TODO: frh -> check this with real data
    citizen: _isCitizen.length > 0,
    votingPower: totalVotingPower.toString(),
    votingPowerRelativeToVotableSupply: Number(
      totalVotingPower / BigInt(votableSupply)
    ),
    votingPowerRelativeToQuorum:
      quorum && quorum > 0n
        ? Number((totalVotingPower * 10000n) / quorum) / 10000
        : 0,
    proposalsCreated: voterStats?.proposals_created || 0n,
    proposalsVotedOn: voterStats?.proposals_voted || 0n,
    votedFor: voterStats?.for?.toFixed() || "0",
    votedAgainst: voterStats?.against?.toFixed() || "0",
    votedAbstain: voterStats?.abstain?.toFixed() || "0",
    votingParticipation: voterStats?.participation_rate || 0,
    lastTenProps: voterStats?.last_10_props?.toFixed() || "0",
    numOfDelegators: numOfDelegators?.num_for_delegators || 0n,
    statement: delegateStatement,
  };
}
