import { paginateResultEx } from "@/app/lib/pagination";
import { cache } from "react";
import { addressOrEnsNameWrap } from "../utils/ensName";

async function getBallotsApi({
  roundId,
  limit,
  offset,
}: {
  roundId: number;
  limit: number;
  offset: number;
}) {
  return paginateResultEx(
    (skip: number, take: number) => {
      return prisma.ballots.findMany({
        take,
        skip,
        where: {
          round: roundId,
        },
        include: {
          allocations: {
            select: {
              metric_id: true,
              allocation: true,
              locked: true,
            },
            orderBy: {
              allocation: "desc",
            },
          },
        },
      });
    },
    { limit, offset }
  );
}

const getBallotApi = async (
  roundId: number,
  ballotCasterAddressOrEns: string
) =>
  addressOrEnsNameWrap(getBallotForAddress, ballotCasterAddressOrEns, {
    roundId,
  });

async function getBallotForAddress({
  roundId,
  address,
}: {
  roundId: number;
  address: string;
}) {
  const ballot = await prisma.ballots.findFirst({
    where: {
      round: roundId,
      address: address,
    },
    include: {
      allocations: {
        select: {
          metric_id: true,
          allocation: true,
          locked: true,
        },
        orderBy: {
          allocation: "desc",
        },
      },
    },
  });

  if (!ballot) {
    return {
      address,
      roundId,
      allocations: [],
    };
  }

  return ballot;
}

export const fetchBallots = cache(getBallotsApi);
export const fetchBallot = cache(getBallotApi);
