import "server-only";

import { paginatePrismaResult } from "@/app/lib/pagination";
import {
  AdvancedVotingPower,
  NumberOfDelegators,
  Prisma,
  VoterStats,
  VoterStatsPayload,
  VotingPower,
} from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { isAddress } from "viem";
import { resolveENSName } from "@/app/lib/ENSUtils";
import { getDelegateStatement } from "../delegateStatement/getDelegateStatement";
import { Delegate } from "./delegate";
import { getCurrentQuorum } from "../quorum/getQuorum";
import { isCitizen } from "../citizens/isCitizen";
import { OptimismContracts } from "@/lib/contracts/contracts";
import { Decimal, DefaultArgs } from "@prisma/client/runtime";

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

  const _delegates = await Promise.all(
    delegates.map(async (delegate) => {
      return {
        citizen: await isCitizen(delegate.delegate),
        statement: await getDelegateStatement({ addressOrENSName: delegate.delegate })
      }
    })
  );

  return {
    meta,
    delegates: delegates.map((delegate, index) => ({
      address: delegate.delegate,
      votingPower: delegate.voting_power?.toFixed(0),
      citizen: _delegates[index].citizen.length > 0,
      statement: _delegates[index].statement,
    }))
  };
}

type DelegateStats = {
  voter: VoterStats["voter"];
  proposals_created: VoterStats["proposals_created"];
  proposals_voted: VoterStats["proposals_voted"];
  for: VoterStats["for"];
  against: VoterStats["against"];
  abstain: VoterStats["abstain"];
  participation_rate: VoterStats["participation_rate"];
  last_10_props: VoterStats["last_10_props"];
  voting_power: VotingPower["voting_power"];
  advanced_vp: AdvancedVotingPower["advanced_vp"];
  num_for_delegators: NumberOfDelegators["num_for_delegators"];
};

export async function getDelegate({
  addressOrENSName,
}: {
  addressOrENSName: string;
}): Promise<Delegate> {
  const address = isAddress(addressOrENSName)
    ? addressOrENSName.toLowerCase()
    : await resolveENSName(addressOrENSName);

  const delegateQuery = prisma.$queryRaw<DelegateStats[]>(
    Prisma.sql`
    SELECT 
      voter,
      proposals_created,
      proposals_voted,
      "for",
      "against",
      "abstain",
      participation_rate,
      last_10_props,
      voting_power,
      advanced_vp,
      num_for_delegators
    FROM 
        (SELECT 1 as dummy) dummy_table
    LEFT JOIN 
        (SELECT * FROM center.voter_stats WHERE voter = ${address}) a ON TRUE
    LEFT JOIN 
        center.advanced_voting_power av ON av.delegate = ${address} AND contract = ${OptimismContracts.alligator.address.toLowerCase()}
    LEFT JOIN 
        (SELECT * FROM center.num_of_delegators nd WHERE delegate = ${address} LIMIT 1) b ON TRUE
    LEFT JOIN 
        (SELECT * FROM center.voting_power vp WHERE vp.delegate = ${address} LIMIT 1) c ON TRUE
    `
  );

  const [delegate, votableSupply, delegateStatement, quorum, _isCitizen] =
    await Promise.all([
      (await delegateQuery)?.[0] || undefined,
      prisma.votableSupply.findFirst({}),
      getDelegateStatement({ addressOrENSName }),
      getCurrentQuorum(),
      isCitizen(address),
    ]);

  const totalVotingPower =
    BigInt(delegate?.voting_power || 0) +
    BigInt(delegate?.advanced_vp?.toFixed(0) || 0);

  // Build out delegate JSON response
  return {
    address: address,
    citizen: _isCitizen.length > 0,
    votingPower: totalVotingPower.toString(),
    votingPowerRelativeToVotableSupply: Number(
      totalVotingPower / BigInt(votableSupply?.votable_supply || 0)
    ),
    votingPowerRelativeToQuorum:
      quorum && quorum > 0n
        ? Number((totalVotingPower * 10000n) / quorum) / 10000
        : 0,
    proposalsCreated: delegate?.proposals_created || 0n,
    proposalsVotedOn: delegate?.proposals_voted || 0n,
    votedFor: delegate?.for?.toFixed() || "0",
    votedAgainst: delegate?.against?.toFixed() || "0",
    votedAbstain: delegate?.abstain?.toFixed() || "0",
    votingParticipation: delegate?.participation_rate || 0,
    lastTenProps: delegate?.last_10_props?.toFixed() || "0",
    numOfDelegators: delegate?.num_for_delegators || 0n,
    statement: delegateStatement,
  };
}
