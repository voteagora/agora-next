import { cache } from "react";
import { addressOrEnsNameWrap } from "../utils/ensName";
import { fetchBallot } from "./getBallots";
import prisma from "@/app/lib/prisma";

export enum DistributionStrategy {
  IMPACT_GROUPS = "IMPACT_GROUPS",
  TOP_TO_BOTTOM = "TOP_TO_BOTTOM",
  TOP_WEIGHTED = "TOP_WEIGHTED",
}

const applyDistributionStrategyApi = async (
  strategy: DistributionStrategy,
  roundId: number,
  category: string,
  ballotCasterAddressOrEns: string
) =>
  addressOrEnsNameWrap(
    applyDistributionStrategyForAddress,
    ballotCasterAddressOrEns,
    {
      strategy,
      roundId,
      category,
    }
  );

async function applyDistributionStrategyForAddress({
  strategy,
  roundId,
  category,
  address,
}: {
  strategy: DistributionStrategy;
  roundId: number;
  category: string;
  address: string;
}) {
  // Get projects allocation
  const projectsAllocation = await prisma.projectAllocations.findMany({
    where: {
      round: roundId,
      address,
    },
    orderBy: {
      rank: "desc",
    },
  });

  const n = projectsAllocation.reduce(
    (acc, project) => acc + (project.impact ? 1 : 0),
    0
  );

  const max = 9.375;
  const min = 0.125;
  const totalFunding = 100;

  // Apply distribution strategy

  const newProjectsAllocation: {
    project_id: string;
    allocation: number | null;
  }[] = [];

  if (strategy === DistributionStrategy.TOP_TO_BOTTOM) {
    const y = topToBottom({
      min,
      total: totalFunding,
      n,
    });

    projectsAllocation.reverse().forEach((project, i) => {
      if (project.impact) {
        newProjectsAllocation.push({
          ...project,
          allocation: y(i),
        });
      } else {
        newProjectsAllocation.push({
          ...project,
          allocation: null,
        });
      }
    });
  }

  if (strategy === DistributionStrategy.TOP_WEIGHTED) {
    const y = topWeighted({
      max: 6.25, // TODO: adjust this number
      total: totalFunding,
      n,
    });

    projectsAllocation.forEach((project, i) => {
      if (project.impact) {
        newProjectsAllocation.push({
          ...project,
          allocation: y(i),
        });
      } else {
        newProjectsAllocation.push({
          ...project,
          allocation: null,
        });
      }
    });

    console.log(
      "total",
      newProjectsAllocation.reduce((acc, p) => acc + (p.allocation ?? 0), 0)
    );
  }

  if (strategy === DistributionStrategy.IMPACT_GROUPS) {
    const nk = projectsAllocation.reduce(
      (acc: [number, number, number, number, number], p) => {
        if (p.impact == 0) {
          return acc;
        }
        acc[p.impact - 1] += 1;
        return acc;
      },
      [0, 0, 0, 0, 0]
    );

    const y = impactGroups({
      max,
      total: totalFunding,
      nk,
    });

    projectsAllocation.forEach((project) => {
      if (project.impact) {
        newProjectsAllocation.push({
          ...project,
          allocation: y(project.impact - 1),
        });
      } else {
        newProjectsAllocation.push({
          ...project,
          allocation: null,
        });
      }
    });
  }

  // Save projects allocations
  await Promise.all(
    newProjectsAllocation.map((p) =>
      prisma.projectAllocations.update({
        where: {
          address_round_project_id: {
            project_id: p.project_id,
            round: roundId,
            address,
          },
        },
        data: { allocation: p.allocation },
      })
    )
  );

  return fetchBallot(roundId, address, category);
}

function topToBottom({
  min,
  total,
  n,
}: {
  min: number;
  total: number;
  n: number;
}) {
  const a = (2 * (total - n * min)) / (n * (n - 1));

  return (i: number) => min + a * i; // return the amount of funding for the i-th project
}

function topWeighted({
  max,
  total,
  n,
}: {
  max: number;
  total: number;
  n: number;
}) {
  const w = (i: number, c: number) => 1 / (i * c + 1); // weight function

  const c = findC({
    max,
    total,
    n,
    w,
  });

  // Total weight
  const W = Array.from({ length: n }).reduce(
    (acc: number, _, i) => acc + w(i, c),
    0
  );

  return (i: number) => (total * w(i, c)) / W; // return the amount of funding for the i-th project
}

// recursively find c that results in max allocation < top
function findC({
  c = 0.9,
  max,
  total,
  n,
  w,
}: {
  c?: number;
  max: number;
  total: number;
  n: number;
  w: (i: number, c: number) => number;
}) {
  const W = Array.from({ length: n }).reduce(
    (acc: number, _, i) => acc + w(i, c),
    0
  );

  const y = (w(0, c) * total) / W;

  if (y > max) {
    return findC({
      c: c * 0.9,
      max,
      total,
      n,
      w,
    });
  }
  return c;
}

function impactGroups({
  max,
  total,
  nk,
}: {
  max: number;
  total: number;
  nk: [number, number, number, number, number]; // number of projects in each impact group
}) {
  // Total weight
  const W = nk.reduce((acc, n, i) => acc + n * (i + 1), 0);

  // Distribution function
  const F = nk.map((_, i) => (total * (i + 1)) / W);

  return (k: number) => F[k]; // return the amount of funding for the k-th impact group
}

export const applyDistributionStrategy = cache(applyDistributionStrategyApi);
