import { cache } from "react";
import { addressOrEnsNameWrap } from "../utils/ensName";
import { fetchBallot } from "./getBallots";
import prisma from "@/app/lib/prisma";

const updateBallotProjectAllocationApi = async (
  allocation: string,
  projectId: string,
  roundId: number,
  ballotCasterAddressOrEns: string
) =>
  addressOrEnsNameWrap(
    updateBallotProjectAllocationForAddress,
    ballotCasterAddressOrEns,
    {
      allocation,
      projectId,
      roundId,
    }
  );

async function updateBallotProjectAllocationForAddress({
  allocation,
  projectId,
  roundId,
  address,
}: {
  allocation: string;
  projectId: string;
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

  try {
    await prisma.projectAllocations.update({
      where: {
        address_round_project_id: {
          project_id: projectId,
          round: roundId,
          address,
        },
      },
      data: {
        allocation,
        updated_at: new Date(),
      },
    });
  } catch (e) {
    // Can't update allocaiton for project that hasn't been evaluated
    return new Response("Allocation cannot be update for this project", {
      status: 400,
    });
  }

  // Return full ballot
  return fetchBallot(roundId, address);
}

export const updateBallotProjectAllocation = cache(
  updateBallotProjectAllocationApi
);

const updateBallotProjectImpactApi = async (
  impact: number,
  projectId: string,
  roundId: number,
  ballotCasterAddressOrEns: string
) =>
  addressOrEnsNameWrap(
    updateBallotProjectImpactForAddress,
    ballotCasterAddressOrEns,
    {
      impact,
      projectId,
      roundId,
    }
  );

async function updateBallotProjectImpactForAddress({
  impact,
  projectId,
  roundId,
  address,
}: {
  impact: number;
  projectId: string;
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

  await prisma.$queryRawUnsafe(
    `
      WITH current_group AS (
          SELECT
              MIN(rank) AS lowest_rank_in_group
          FROM
              retro_funding.project_allocations
          WHERE
              impact = ${impact}
      ),
      lower_group AS (
          SELECT
              MAX(rank) AS highest_rank_in_lower_group
          FROM
              retro_funding.project_allocations
          WHERE
              impact = ${impact} - 1
      ),
      estimated_rank AS (
          SELECT
              CASE
                  WHEN ${impact} = 0 THEN 0
                  ELSE 
                      CASE
                          WHEN lowest_rank_in_group != 0 THEN 
                              ROUND(COALESCE((lowest_rank_in_group + COALESCE(highest_rank_in_lower_group, 100000 * (${impact} - 1))) / 1.4, lowest_rank_in_group))
                          ELSE 
                              100000 * ${impact}
                      END
              END AS computed_rank
          FROM
              current_group, lower_group
      )
      INSERT INTO retro_funding.project_allocations (address, round, project_id, impact, rank)
      VALUES ($1, $2, $3, ${impact}, (SELECT computed_rank FROM estimated_rank))
      ON CONFLICT (address, round, project_id)
      DO UPDATE SET 
          impact = EXCLUDED.impact,
          rank = EXCLUDED.rank;
    `,
    address,
    roundId,
    projectId
  );

  // Return full ballot
  return fetchBallot(roundId, address);
}

export const updateBallotProjectImpact = cache(updateBallotProjectImpactApi);

const updateBallotProjectPositionApi = async (
  position: number,
  projectId: string,
  roundId: number,
  ballotCasterAddressOrEns: string
) =>
  addressOrEnsNameWrap(
    updateBallotProjectPositionForAddress,
    ballotCasterAddressOrEns,
    {
      position,
      projectId,
      roundId,
    }
  );

async function updateBallotProjectPositionForAddress({
  position,
  projectId,
  roundId,
  address,
}: {
  position: number;
  projectId: string;
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

  // In SQL position is 1-indexed. In JS it's 0-indexed, so we need to add 1
  await prisma.$queryRawUnsafe(
    `
      WITH ranked_projects AS (
          SELECT
              project_id,
              rank,
              impact,
              ROW_NUMBER() OVER (ORDER BY rank) AS current_position
          FROM
              retro_funding.project_allocations
      ),
      position_bounds AS (
          SELECT
              (SELECT rank FROM ranked_projects WHERE current_position = ${position}) AS lower_bound,
              (SELECT rank FROM ranked_projects WHERE current_position = ${position} + 1) AS upper_bound
      ),
      project_impact AS (
          SELECT
              impact
          FROM
              retro_funding.project_allocations
          WHERE
              address = $1 AND round = $2 AND project_id = $3
      ),
      impact_bounds AS (
          SELECT
              (SELECT impact FROM ranked_projects WHERE current_position = ${position}) AS lower_impact,
              (SELECT impact FROM ranked_projects WHERE current_position = ${position} + 1) AS upper_impact,
              (SELECT impact FROM project_impact) AS project_impact
      ),
      new_rank_value AS (
          SELECT
              COALESCE(ROUND((lower_bound + upper_bound) / 2), 
                  CASE
                      WHEN lower_bound IS NULL THEN ROUND(upper_bound / 1.4)
                      WHEN upper_bound IS NULL THEN lower_bound + 1000
                      ELSE NULL
                  END
              ) AS new_rank
          FROM
              position_bounds
      ),
      new_impact_value AS (
          SELECT
              LEAST(COALESCE(upper_impact, 5), GREATEST(project_impact, COALESCE(lower_impact, 1))) as new_impact
          FROM
              impact_bounds
      )
      UPDATE
          retro_funding.project_allocations
      SET
          impact = (SELECT new_impact FROM new_impact_value)::INTEGER,
          rank = (SELECT new_rank FROM new_rank_value)
      WHERE
          address = $1 AND round = $2 AND project_id = $3;
    `,
    address,
    roundId,
    projectId
  );

  // Return full ballot
  return fetchBallot(roundId, address);
}

export const updateBallotProjectPosition = cache(
  updateBallotProjectPositionApi
);

const updateAllProjectsInBallotApi = async (
  projects: {
    projectId: string;
    allocation: string;
    impact: number;
  }[],
  category: string,
  roundId: number,
  ballotCasterAddressOrEns: string
) =>
  addressOrEnsNameWrap(
    updateAllProjectsInBallotForAddress,
    ballotCasterAddressOrEns,
    {
      projects,
      category,
      roundId,
    }
  );

async function updateAllProjectsInBallotForAddress({
  projects,
  category,
  roundId,
  address,
}: {
  projects: {
    projectId: string;
    allocation: string;
    impact: number;
  }[];
  category: string;
  roundId: number;
  address: string;
}) {
  const categoryProjects = await prisma.mockProjects.findMany({
    where: {
      category_slug: category,
    },
  });

  // check if all projects are valid
  const isValid =
    projects.every((project) =>
      categoryProjects.some(
        (categoryProject) => categoryProject.id === project.projectId
      )
    ) && projects.length === categoryProjects.length;

  if (!isValid) {
    throw new Error("Invalid projects for badgeholder category");
  }

  // Sort projects by impact and allocation lowest to highest
  projects.sort(
    (a, b) => a.impact - b.impact || Number(a.allocation) - Number(b.allocation)
  );

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

  await Promise.all(
    projects.map((project, i) =>
      prisma.projectAllocations.upsert({
        where: {
          address_round_project_id: {
            project_id: project.projectId,
            round: roundId,
            address,
          },
        },
        update: {
          allocation: project.allocation,
          updated_at: new Date(),
        },
        create: {
          project_id: project.projectId,
          round: roundId,
          address,
          allocation: project.allocation,
          impact: project.impact,
          rank: (500_000 / projects.length) * (i + 1),
        },
      })
    )
  );

  // Return full ballot
  return fetchBallot(roundId, address, category);
}

export const updateAllProjectsInBallot = cache(updateAllProjectsInBallotApi);
