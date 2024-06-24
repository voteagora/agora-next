import { Ballot, BallotResponse } from "./ballot";

const CAP = 0.05;
const TOTAL_FUNDING = 10_000_000;

export function calculateAllocations(
  ballot: Ballot[],
  cap: number = CAP
): BallotResponse {
  const projectTotals = new Map<string, number>();
  const projectData = new Map<
    string,
    {
      name: string;
      image: string;
      is_os: boolean;
      allocations_per_metric: {
        metric_id: string;
        allocation: number;
      }[];
    }
  >();

  ballot.map((b) => {
    const metricId = b.metric_id;
    const adjustedValues = b.allocations.map((a) => {
      const value = a.is_os
        ? a.value * b.os_multiplier
        : b.os_only
          ? 0
          : a.value;
      return {
        ...a,
        value,
      };
    });

    const total = adjustedValues.reduce((acc, a) => acc + a.value, 0);

    return {
      address: b.address,
      round_id: b.round,
      status: b.status,
      metric_id: metricId,
      projectAllocations: adjustedValues.map((a) => {
        const data = projectData.get(a.project_id);
        projectData.set(a.project_id, {
          name: a.name,
          image: a.image,
          is_os: a.is_os,
          allocations_per_metric: [
            ...(data?.allocations_per_metric || []),
            {
              metric_id: b.metric_id,
              allocation: (a.value / total) * (b.allocation / 100),
            },
          ],
        });

        projectTotals.set(
          a.project_id,
          (projectTotals.get(a.project_id) || 0) +
            (a.value / total) * (b.allocation / 100)
        );

        return {
          project_id: a.project_id,
          name: a.name,
          image: a.image,
          is_os: a.is_os,
          allocation: (a.value / total) * (b.allocation / 100),
        };
      }),
      locked: b.locked,
    };
  });

  // transpose to get the allocations per project
  const allocations = Array.from(projectData.entries())
    .map(([projectId, data]) => ({
      project_id: projectId,
      name: data.name,
      image: data.image,
      is_os: data.is_os,
      allocation_per_metric: data.allocations_per_metric,
      allocation: data.allocations_per_metric.reduce(
        (acc, a) => acc + a.allocation,
        0
      ),
    }))
    .sort((a, b) => b.allocation - a.allocation);

  // cap allocations
  let total = 1;
  let adjustedTotal = 1;
  const cappedAllocations = allocations.map((a) => {
    const cappedAllocation = Math.min(
      (a.allocation * adjustedTotal) / total,
      cap
    );
    total -= a.allocation; // remove the allocation from the total
    adjustedTotal -= cappedAllocation; // add the exess to the total
    return {
      ...a,
      allocation: cappedAllocation * TOTAL_FUNDING,
      allocation_per_metric: a.allocation_per_metric.map((apm) => {
        return {
          ...apm,
          allocation:
            Math.round(
              (100 * (TOTAL_FUNDING * (apm.allocation * cappedAllocation))) /
                a.allocation
            ) / 100, // prevent floating point errors
        };
      }),
    };
  });

  return {
    address: ballot[0].address,
    round_id: ballot[0].round,
    status: ballot[0].status,
    allocations: ballot.map((b) => ({
      metric_id: b.metric_id,
      allocation: Number(b.allocation),
      locked: b.locked,
    })),
    project_allocations: cappedAllocations,
  };
}
