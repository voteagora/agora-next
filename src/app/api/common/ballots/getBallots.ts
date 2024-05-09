import { paginateResultEx } from "@/app/lib/pagination";
import { cache } from "react";

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

async function getBallotApi(roundId: string, ballotCasterAddressOrEns: string) {
  const defaultBallot = {
    ballotId: 0,
    roundId: roundId,
    status: "PENDING",
    allocations: [
      {
        metricId: 0,
        allocation: "0",
      },
    ],
    ballotCasterAddress: ballotCasterAddressOrEns,
  };

  return defaultBallot;
}

export const fetchBallots = cache(getBallotsApi);
export const fetchBallot = cache(getBallotApi);
