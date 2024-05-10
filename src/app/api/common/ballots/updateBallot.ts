import { cache } from "react";
import { addressOrEnsNameWrap } from "../utils/ensName";

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
  const allocation = await prisma.allocations.findFirst({
    where: {
      metric_id: data.metric_id,
      address,
    },
  });

  if (!allocation) {
    const ballot = await prisma.ballots.upsert({
      where: {
        address,
      },
      update: {},
      create: {
        round: roundId,
        address,
      },
    });
    return prisma.allocations.create({
      data: {
        address,
        metric_id: data.metric_id,
        allocation: data.allocation,
        locked: data.locked,
      },
    });
  }

  return prisma.allocations.update({
    where: {
      id: allocation.id,
    },
    data: {
      allocation: data.allocation,
      locked: data.locked,
    },
  });
}

export const updateBallotMetric = cache(updateBallotMetricApi);
