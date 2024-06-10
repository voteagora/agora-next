import { cache } from "react";
import { addressOrEnsNameWrap } from "../utils/ensName";
import prisma from "@/app/lib/prisma";
import { fetchBallot } from "./getBallots";

type BallotContent = {
  metric_id: string;
  allocation: number;
  locked: boolean;
};

const updateBallotMetricApi = async (
  data: BallotContent,
  roundId: number,
  ballotCasterAddressOrEns: string
) =>
  addressOrEnsNameWrap(updateBallotMetricForAddress, ballotCasterAddressOrEns, {
    data,
    roundId,
  });

async function updateBallotMetricForAddress({
  data,
  roundId,
  address,
}: {
  data: BallotContent;
  roundId: number;
  address: string;
}) {
  // Create ballot if it doesn't exist
  await prisma.ballots.upsert({
    where: {
      address_round: {
        address,
        round: roundId,
      },
    },
    update: {
      updated_at: new Date(),
    },
    create: {
      round: roundId,
      address,
    },
  });

  // Add or update allocation
  await prisma.allocations.upsert({
    where: {
      address_round_metric_id: {
        metric_id: data.metric_id,
        round: roundId,
        address,
      },
    },
    update: {
      allocation: data.allocation,
      locked: data.locked,
      updated_at: new Date(),
    },
    create: {
      metric_id: data.metric_id,
      round: roundId,
      address,
      allocation: data.allocation,
      locked: data.locked,
    },
  });

  // Autoreblance all other allocations
  const allocations = await prisma.allocations.findMany({
    where: {
      address,
      round: roundId,
    },
  });

  const [amountToBalance, totalUnlocked] = allocations.reduce(
    (acc, allocation) => [
      acc[0] -
        (allocation.locked || allocation.metric_id === data.metric_id
          ? Number(allocation.allocation.toFixed(2))
          : 0),
      acc[1] +
        (allocation.locked || allocation.metric_id === data.metric_id
          ? 0
          : Number(allocation.allocation.toFixed(2))),
    ],
    [100, 0]
  );

  await Promise.all(
    allocations.map(async (allocation) => {
      if (!allocation.locked && allocation.metric_id !== data.metric_id) {
        await prisma.allocations.update({
          where: {
            address_round_metric_id: {
              metric_id: allocation.metric_id,
              round: roundId,
              address,
            },
          },
          data: {
            ...allocation,
            allocation:
              (Number(allocation.allocation.toFixed(2)) / totalUnlocked) *
              amountToBalance,
          },
        });
      }
    })
  );

  // Return full ballot
  return fetchBallot(roundId, address);
}

const deleteBallotMetricApi = async (
  metricId: string,
  roundId: number,
  ballotCasterAddressOrEns: string
) =>
  addressOrEnsNameWrap(deleteBallotMetricForAddress, ballotCasterAddressOrEns, {
    metricId,
    roundId,
  });

async function deleteBallotMetricForAddress({
  metricId,
  roundId,
  address,
}: {
  metricId: string;
  roundId: number;
  address: string;
}) {
  return prisma.allocations.deleteMany({
    where: {
      metric_id: metricId,
      address,
      round: roundId,
    },
  });
}

const updateBallotOsMultiplierApi = async (
  multiplier: number,
  roundId: number,
  ballotCasterAddressOrEns: string
) =>
  addressOrEnsNameWrap(
    updateBallotOsMultiplierForAddress,
    ballotCasterAddressOrEns,
    {
      multiplier,
      roundId,
    }
  );

async function updateBallotOsMultiplierForAddress({
  multiplier,
  roundId,
  address,
}: {
  multiplier: number;
  roundId: number;
  address: string;
}) {
  await prisma.ballots.upsert({
    where: {
      address_round: {
        address,
        round: roundId,
      },
    },
    update: {
      os_multiplier: multiplier,
      updated_at: new Date(),
    },
    create: {
      round: roundId,
      address,
      os_multiplier: multiplier,
    },
  });

  return fetchBallot(roundId, address);
}

const updateBallotOsOnlyApi = async (
  toggle: boolean,
  roundId: number,
  ballotCasterAddressOrEns: string
) =>
  addressOrEnsNameWrap(updateBallotOsOnlyForAddress, ballotCasterAddressOrEns, {
    toggle,
    roundId,
  });

async function updateBallotOsOnlyForAddress({
  toggle,
  roundId,
  address,
}: {
  toggle: boolean;
  roundId: number;
  address: string;
}) {
  await prisma.ballots.upsert({
    where: {
      address_round: {
        address,
        round: roundId,
      },
    },
    update: {
      os_only: toggle,
      updated_at: new Date(),
    },
    create: {
      round: roundId,
      address,
      os_only: toggle,
    },
  });

  return fetchBallot(roundId, address);
}

export const updateBallotMetric = cache(updateBallotMetricApi);
export const deleteBallotMetric = cache(deleteBallotMetricApi);
export const updateBallotOsMultiplier = cache(updateBallotOsMultiplierApi);
export const updateBallotOsOnly = cache(updateBallotOsOnlyApi);
