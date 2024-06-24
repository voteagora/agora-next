import { Ballot, BallotResponse } from "./ballot";

const CAP = 0.05;
const TOTAL_FUNDING = 10_000_000;

export function calculateAllocations(ballot: Ballot[]): BallotResponse {
  const projectTotals = new Map<string, number>();
  const projectData = new Map<
    string,
    { name: string; image: string; is_os: boolean }
  >();

  const adjustedAllocations = ballot.map((b) => {
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

    console.log(adjustedValues);

    const total = adjustedValues.reduce((acc, a) => acc + a.value, 0);

    let excess = 0;

    const projectAllocations = new Map<string, number>();
    const cappedAllocations = adjustedValues.map((a) => {
      console.log(excess);

      const allocation = a.value / total;
      const cappedAllocation = Math.min(allocation + excess * allocation, CAP); // in %
      console.log(allocation + excess * allocation, cappedAllocation);
      excess += allocation + excess * allocation - cappedAllocation;

      console.log(a.project_id, a.value, excess, total);
      console.log(a.project_id, cappedAllocation);

      // Add to project totals
      projectTotals.set(
        a.project_id,
        (projectTotals.get(a.project_id) || 0) +
          (cappedAllocation * b.allocation) / 100
      );

      // Add to project allocations
      projectAllocations.set(
        a.project_id,
        (cappedAllocation * b.allocation) / 100
      );

      // Add to project data
      projectData.set(a.project_id, {
        name: a.name,
        image: a.image,
        is_os: a.is_os,
      });

      return {
        ...a,
        allocation: (cappedAllocation * b.allocation) / 100,
      };
    });

    console.log(projectAllocations);
    console.log(projectTotals);

    return {
      address: b.address,
      round_id: b.round,
      status: b.status,
      metric_id: metricId,
      allocation: (b.allocation / 100) * TOTAL_FUNDING, // in OP adjusded for ballot allocation
      projectAllocations: projectAllocations,
      locked: b.locked,
    };
  });

  console.log("projectTotals", projectTotals);

  const projectAllocations = Array.from(projectTotals.entries())
    .map(([projectId, allocation]) => ({
      project_id: projectId,
      name: projectData.get(projectId)!.name,
      image: projectData.get(projectId)!.image,
      is_os: projectData.get(projectId)!.is_os,
      allocation: allocation * TOTAL_FUNDING,
      allocation_per_metric: adjustedAllocations.map((a) => ({
        metric_id: a.metric_id,
        allocation: a.projectAllocations.get(projectId)! * TOTAL_FUNDING,
      })),
    }))
    .sort((a, b) => b.allocation - a.allocation); // Sort by allocation desc

  console.log(projectAllocations);

  return {
    address: ballot[0].address,
    round_id: ballot[0].round,
    status: ballot[0].status,
    allocations: adjustedAllocations.map((a) => ({
      metric_id: a.metric_id,
      allocation: a.allocation,
      locked: a.locked,
    })),
    project_allocations: projectAllocations,
  };
}
