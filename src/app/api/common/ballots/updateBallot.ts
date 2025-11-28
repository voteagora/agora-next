import { cache } from "react";
import { addressOrEnsNameWrap } from "../utils/ensName";
import { prismaWeb2Client } from "@/app/lib/web2";
import { fetchBallot } from "./getBallots";
import { autobalanceAllocations } from "./autobalance";

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
  await prismaWeb2Client.ballots.upsert({
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
  await prismaWeb2Client.allocations.upsert({
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

  await autobalanceMetricsAllocations(address, roundId, data.metric_id);

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
  await prismaWeb2Client.allocations.deleteMany({
    where: {
      metric_id: metricId,
      address,
      round: roundId,
    },
  });

  await autobalanceMetricsAllocations(address, roundId, metricId);

  return fetchBallot(roundId, address);
}

async function autobalanceMetricsAllocations(
  address: string,
  roundId: number,
  metricToSkip: string
) {
  const allocations = (
    await prismaWeb2Client.allocations.findMany({
      where: {
        address,
        round: roundId,
      },
    })
  ).map((allocation) => ({
    ...allocation,
    id: allocation.metric_id,
    locked: allocation.locked || false,
  }));

  const autobalancedAllocations = autobalanceAllocations({
    allocations,
    idToSkip: metricToSkip,
  });

  await Promise.all(
    autobalancedAllocations.map(async (allocation) => {
      await prismaWeb2Client.allocations.update({
        where: {
          address_round_metric_id: {
            metric_id: allocation.id,
            address,
            round: roundId,
          },
        },
        data: {
          allocation: allocation.allocation,
          locked: allocation.locked,
        },
      });
    })
  );
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
  await prismaWeb2Client.ballots.upsert({
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
  await prismaWeb2Client.ballots.upsert({
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

const updateBallotBudgetApi = async (
  budget: number,
  roundId: number,
  category: string,
  ballotCasterAddressOrEns: string
) =>
  addressOrEnsNameWrap(updateBallotBudgetForAddress, ballotCasterAddressOrEns, {
    budget,
    roundId,
    category,
  });

async function updateBallotBudgetForAddress({
  roundId,
  address,
  budget,
  category,
}: {
  roundId: number;
  address: string;
  budget: number;
  category: string;
}) {
  await prismaWeb2Client.ballots.upsert({
    where: {
      address_round: {
        address,
        round: roundId,
      },
    },
    update: {
      updated_at: new Date(),
      budget,
    },
    create: {
      round: roundId,
      address,
      budget,
    },
  });

  return fetchBallot(roundId, address, category);
}

export const updateBallotMetric = cache(updateBallotMetricApi);
export const deleteBallotMetric = cache(deleteBallotMetricApi);
export const updateBallotOsMultiplier = cache(updateBallotOsMultiplierApi);
export const updateBallotOsOnly = cache(updateBallotOsOnlyApi);
export const updateBallotBudget = cache(updateBallotBudgetApi);
