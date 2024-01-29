import "server-only";

import { paginatePrismaResult } from "@/app/lib/pagination";
import {
  AdvancedVotingPower,
  Delegates,
  Prisma,
  VoterStats,
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
import { DEPLOYMENT_NAME } from "@/lib/config";

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
          return prisma.$queryRawUnsafe<Prisma.DelegatesGetPayload<true>[]>(
            `
            SELECT *, setseed($1)::Text
            FROM ${DEPLOYMENT_NAME + ".delegates"}
            WHERE voting_power > 0
            ORDER BY -log(random()) / voting_power
            OFFSET $2
            LIMIT $3;
            `,
            seed,
            skip,
            take
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
        statement: await getDelegateStatement({
          addressOrENSName: delegate.delegate,
        }),
      };
    })
  );

  return {
    meta,
    delegates: delegates.map((delegate, index) => ({
      address: delegate.delegate,
      votingPower: delegate.voting_power?.toFixed(0),
      citizen: _delegates[index].citizen.length > 0,
      statement: _delegates[index].statement,
    })),
  };
}

type DelegateStats = {
  voter: VoterStats["voter"];
  proposals_voted: VoterStats["proposals_voted"];
  for: VoterStats["for"];
  against: VoterStats["against"];
  abstain: VoterStats["abstain"];
  participation_rate: VoterStats["participation_rate"];
  last_10_props: VoterStats["last_10_props"];
  voting_power: VotingPower["voting_power"];
  advanced_vp: AdvancedVotingPower["advanced_vp"];
  num_of_delegators: Delegates["num_of_delegators"];
};

export async function getDelegate({
  addressOrENSName,
}: {
  addressOrENSName: string;
}): Promise<Delegate> {
  const address = isAddress(addressOrENSName)
    ? addressOrENSName.toLowerCase()
    : await resolveENSName(addressOrENSName);

  const delegateQuery = prisma.$queryRawUnsafe<DelegateStats[]>(
    `
    SELECT 
      voter,
      proposals_voted,
      "for",
      "against",
      "abstain",
      participation_rate,
      last_10_props,
      voting_power,
      advanced_vp,
      num_of_delegators
    FROM 
        (SELECT 1 as dummy) dummy_table
    LEFT JOIN 
        (SELECT * FROM ${
          DEPLOYMENT_NAME + ".voter_stats"
        } WHERE voter = $1) a ON TRUE
    LEFT JOIN 
      ${
        DEPLOYMENT_NAME + ".advanced_voting_power"
      } av ON av.delegate = $1 AND contract = $2
    LEFT JOIN 
        (SELECT num_of_delegators FROM ${
          DEPLOYMENT_NAME + ".delegates"
        } nd WHERE delegate = $1 LIMIT 1) b ON TRUE
    LEFT JOIN 
        (SELECT * FROM ${
          DEPLOYMENT_NAME + ".voting_power"
        } vp WHERE vp.delegate = $1 LIMIT 1) c ON TRUE
    `,
    address,
    OptimismContracts.alligator.address.toLowerCase()
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
    proposalsCreated: 0n,
    proposalsVotedOn: delegate?.proposals_voted || 0n,
    votedFor: delegate?.for?.toString() || "0",
    votedAgainst: delegate?.against?.toString() || "0",
    votedAbstain: delegate?.abstain?.toString() || "0",
    votingParticipation: delegate?.participation_rate || 0,
    lastTenProps: delegate?.last_10_props?.toFixed() || "0",
    numOfDelegators: BigInt(delegate?.num_of_delegators?.toFixed(0) || 0n),
    statement: delegateStatement,
  };
}
