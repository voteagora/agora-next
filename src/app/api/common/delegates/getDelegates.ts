import { paginatePrismaResult } from "@/app/lib/pagination";
import {
  OptimismAdvancedVotingPower,
  OptimismDelegates,
  OptimismVoterStats,
  OptimismVotingPower,
  Prisma,
} from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { isAddress } from "viem";
import { resolveENSName } from "@/app/lib/ENSUtils";
import { Delegate } from "./delegate";
import { isCitizen } from "../citizens/isCitizen";
import Tenant from "@/lib/tenant/tenant";
import { getDelegateStatement } from "@/app/api/common/delegateStatement/getDelegateStatement";
import { getCurrentQuorum } from "@/app/api/common/quorum/getQuorum";

type DelegatesGetPayload = Prisma.OptimismDelegatesGetPayload<true>;

export async function getDelegates({
  page = 1,
  sort = "weighted_random",
  seed,
}: {
  page: number;
  sort: string;
  seed?: number;
}) {
  const pageSize = 20;
  const { namespace } = Tenant.getInstance();

  const { meta, data: delegates } = await paginatePrismaResult(
    async (skip: number, take: number) => {
      switch (sort) {
        case "most_delegators":
          return prisma.$queryRawUnsafe<DelegatesGetPayload[]>(
            `
            SELECT *
            FROM ${namespace + ".delegates"}
            WHERE num_of_delegators IS NOT NULl
            ORDER BY num_of_delegators DESC
            OFFSET $1
            LIMIT $2;
            `,
            skip,
            take
          );
        case "weighted_random":
          await prisma.$executeRawUnsafe(`SELECT setseed($1);`, seed);
          return prisma.$queryRawUnsafe<DelegatesGetPayload[]>(
            `
            SELECT *
            FROM ${namespace + ".delegates"}
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
          return prisma[`${namespace}Delegates`].findMany({
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
        statement: await getDelegateStatement(delegate.delegate),
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
    seed,
  };
}

type DelegateStats = {
  voter: OptimismVoterStats["voter"];
  proposals_voted: OptimismVoterStats["proposals_voted"];
  for: OptimismVoterStats["for"];
  against: OptimismVoterStats["against"];
  abstain: OptimismVoterStats["abstain"];
  participation_rate: OptimismVoterStats["participation_rate"];
  last_10_props: OptimismVoterStats["last_10_props"];
  voting_power: OptimismVotingPower["voting_power"];
  advanced_vp: OptimismAdvancedVotingPower["advanced_vp"];
  num_of_delegators: OptimismDelegates["num_of_delegators"];
};

export async function getDelegate(addressOrENSName: string): Promise<Delegate> {
  const { namespace, contracts } = Tenant.getInstance();
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
        (SELECT * FROM ${namespace + ".voter_stats"} WHERE voter = $1) a ON TRUE
    LEFT JOIN 
      ${
        namespace + ".advanced_voting_power"
      } av ON av.delegate = $1 AND contract = $2
    LEFT JOIN 
        (SELECT num_of_delegators FROM ${
          namespace + ".delegates"
        } nd WHERE delegate = $1 LIMIT 1) b ON TRUE
    LEFT JOIN 
        (SELECT * FROM ${
          namespace + ".voting_power"
        } vp WHERE vp.delegate = $1 LIMIT 1) c ON TRUE
    `,
    address,
    contracts.alligator!.address
  );

  const [delegate, votableSupply, delegateStatement, quorum, _isCitizen] =
    await Promise.all([
      delegateQuery.then((result) => result?.[0] || undefined),
      prisma[`${namespace}VotableSupply`].findFirst({}),
      getDelegateStatement(addressOrENSName),
      getCurrentQuorum(),
      isCitizen(address),
    ]);

  const numOfDelegatesQuery = prisma.$queryRawUnsafe<
    { num_of_delegators: BigInt }[]
  >(
    `
    SELECT 
      SUM(count) as num_of_delegators
    FROM (
      SELECT count(*)
      FROM optimism.advanced_delegatees
      WHERE "to"=$1 AND contract=$2 AND delegated_amount > 0
      UNION ALL
      SELECT
        SUM((CASE WHEN to_delegate=$1 THEN 1 ELSE 0 END) - (CASE WHEN from_delegate=$1 THEN 1 ELSE 0 END)) as num_of_delegators
      FROM center.optimism_delegate_changed_events
      WHERE to_delegate=$1 OR from_delegate=$1
    ) t;
    `,
    address,
    contracts.alligator!.address
  );

  const totalVotingPower =
    BigInt(delegate?.voting_power || 0) +
    BigInt(delegate?.advanced_vp?.toFixed(0) || 0);

  const cachedNumOfDelegators = BigInt(
    delegate.num_of_delegators?.toFixed() || "0"
  );

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
    numOfDelegators:
      // Use cached amount when recalculation is expensive
      cachedNumOfDelegators < 1000n
        ? BigInt(
            (await numOfDelegatesQuery)?.[0]?.num_of_delegators.toString() ||
              "0"
          )
        : cachedNumOfDelegators,
    statement: delegateStatement,
  };
}
