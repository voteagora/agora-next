import { cache } from "react";
import { addressOrEnsNameWrap } from "../utils/ensName";
import { fetchBallot } from "./getBallots";
import { prismaWeb2Client } from "@/app/lib/web2";

const updateBallotProjectAllocationApi = async (
  allocation: string,
  projectId: string,
  roundId: number,
  category: string,
  ballotCasterAddressOrEns: string
) =>
  addressOrEnsNameWrap(
    updateBallotProjectAllocationForAddress,
    ballotCasterAddressOrEns,
    {
      allocation,
      projectId,
      roundId,
      category,
    }
  );

async function updateBallotProjectAllocationForAddress({
  allocation,
  projectId,
  roundId,
  category,
  address,
}: {
  allocation: string;
  projectId: string;
  roundId: number;
  category: string;
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

  try {
    await prismaWeb2Client.projectAllocations.update({
      where: {
        address_round_project_id: {
          project_id: projectId,
          round: roundId,
          address,
        },
      },
      data: {
        allocation: Math.round(Number(allocation) * 100) / 100,
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
  return fetchBallot(roundId, address, category);
}

export const updateBallotProjectAllocation = cache(
  updateBallotProjectAllocationApi
);

const updateBallotProjectImpactApi = async (
  impact: number,
  projectId: string,
  roundId: number,
  category: string,
  ballotCasterAddressOrEns: string
) =>
  addressOrEnsNameWrap(
    updateBallotProjectImpactForAddress,
    ballotCasterAddressOrEns,
    {
      impact,
      projectId,
      roundId,
      category,
    }
  );

// Rank is calcualted based on the impact of the project. The higher the impact, the higher the rank.
// If project's impact is 0 (conflict of interest), the rank is 0.
// The rank is a number between 0 and >500,000. The spread is to allow for easy reordering of projects.

async function updateBallotProjectImpactForAddress({
  impact,
  projectId,
  roundId,
  category,
  address,
}: {
  impact: number;
  projectId: string;
  roundId: number;
  category: string;
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

  await prismaWeb2Client.$queryRawUnsafe(
    `
      WITH current_group AS (
          SELECT
              MIN(rank) AS lowest_rank_in_group
          FROM
              retro_funding.project_allocations
          WHERE
              impact = ${impact}
              AND address = $1 AND round = $2
      ),
      lower_group AS (
          SELECT
              MAX(rank) AS highest_rank_in_lower_group
          FROM
              retro_funding.project_allocations
          WHERE
              impact = ${impact} - 1
              AND address = $1 AND round = $2
      ),
      estimated_rank AS (
          SELECT
              CASE
                  WHEN ${impact} = 0 THEN 0
                  ELSE 
                      CASE
                          WHEN lowest_rank_in_group != 0 THEN 
                              ROUND(COALESCE((lowest_rank_in_group + COALESCE(highest_rank_in_lower_group, 100000 * (${impact} - 1))) / 2, lowest_rank_in_group))
                          ELSE 
                              100000 * ${impact}
                      END
              END AS computed_rank
          FROM
              current_group, lower_group
      )
      INSERT INTO retro_funding.project_allocations (address, round, project_id, impact, rank${impact !== 0 ? "" : ", allocation"})
      VALUES ($1, $2, $3, ${impact}, (SELECT computed_rank FROM estimated_rank)${impact !== 0 ? "" : `, null`})
      ON CONFLICT (address, round, project_id)
      DO UPDATE SET 
          impact = EXCLUDED.impact,
          rank = EXCLUDED.rank
          ${impact !== 0 ? "" : `, allocation = EXCLUDED.allocation`};
    `,
    address,
    roundId,
    projectId
  );

  // Return full ballot
  return fetchBallot(roundId, address, category);
}

export const updateBallotProjectImpact = cache(updateBallotProjectImpactApi);

const updateBallotProjectPositionApi = async (
  position: number,
  projectId: string,
  roundId: number,
  category: string,
  ballotCasterAddressOrEns: string
) =>
  addressOrEnsNameWrap(
    updateBallotProjectPositionForAddress,
    ballotCasterAddressOrEns,
    {
      position,
      projectId,
      roundId,
      category,
    }
  );

// Rank is assigned based on the position of the project in the list. The lower the position, the higher the rank.
// New rank is calculated as the average of the ranks of the projects above and below the new position.

async function updateBallotProjectPositionForAddress({
  position,
  projectId,
  roundId,
  category,
  address,
}: {
  position: number;
  projectId: string;
  roundId: number;
  category: string;
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

  // In SQL position is 1-indexed. In JS it's 0-indexed, so we need to add 1
  await prismaWeb2Client.$queryRawUnsafe(
    `
      WITH ranked_projects AS (
          SELECT
              project_id,
              rank,
              impact,
              ROW_NUMBER() OVER (ORDER BY rank DESC) - 1 AS current_position
          FROM
              retro_funding.project_allocations
          WHERE
              address = $1 AND round = $2 AND impact > 0
      ),
      current_project_position AS (
          SELECT current_position
          FROM ranked_projects
          WHERE project_id = $3
      ),
      project_count AS (
          SELECT MAX(current_position) AS max_position
          FROM ranked_projects
      ),
      position_bounds AS (
          SELECT
              CASE
                  WHEN ${position} < (SELECT current_position FROM current_project_position)
                  THEN (SELECT rank FROM ranked_projects WHERE current_position = ${position} - 1)
                  WHEN ${position} > (SELECT max_position FROM project_count)
                  THEN (SELECT rank FROM ranked_projects WHERE current_position = (SELECT max_position FROM project_count))
                  ELSE (SELECT rank FROM ranked_projects WHERE current_position = ${position})
              END AS lower_bound,
              CASE
                  WHEN ${position} < (SELECT current_position FROM current_project_position)
                  THEN (SELECT rank FROM ranked_projects WHERE current_position = ${position})
                  WHEN ${position} > (SELECT max_position FROM project_count)
                  THEN NULL
                  ELSE (SELECT rank FROM ranked_projects WHERE current_position = ${position} + 1)
              END AS upper_bound
      ),
      impact_bounds AS (
          SELECT
              CASE
                  WHEN ${position} < (SELECT current_position FROM current_project_position)
                  THEN (SELECT impact FROM ranked_projects WHERE current_position = ${position} - 1)
                  WHEN ${position} > (SELECT max_position FROM project_count)
                  THEN (SELECT impact FROM ranked_projects WHERE current_position = (SELECT max_position FROM project_count))
                  ELSE (SELECT impact FROM ranked_projects WHERE current_position = ${position})
              END AS lower_impact,
              CASE
                  WHEN ${position} < (SELECT current_position FROM current_project_position)
                  THEN (SELECT impact FROM ranked_projects WHERE current_position = ${position})
                  WHEN ${position} > (SELECT max_position FROM project_count)
                  THEN NULL
                  ELSE (SELECT impact FROM ranked_projects WHERE current_position = ${position} + 1)
              END AS upper_impact,
              (SELECT impact FROM retro_funding.project_allocations WHERE address = $1 AND round = $2 AND project_id = $3) AS project_impact
      ),
      new_rank_value AS (
          SELECT
              GREATEST(1, COALESCE(ROUND((lower_bound + upper_bound) / 2),
                  CASE
                      WHEN lower_bound IS NULL AND upper_bound IS NULL THEN 1000
                      WHEN lower_bound IS NULL THEN upper_bound + 1000
                      WHEN upper_bound IS NULL THEN lower_bound - 1000
                      ELSE NULL
                  END
              )) AS new_rank
          FROM
              position_bounds
      ),
      new_impact_value AS (
          SELECT
              CASE
                  WHEN upper_impact IS NULL AND lower_impact IS NULL THEN project_impact
                  WHEN upper_impact IS NULL THEN GREATEST(1, lower_impact - 1)
                  WHEN lower_impact IS NULL THEN LEAST(5, upper_impact + 1)
                  ELSE ROUND((lower_impact + upper_impact) / 2.0)
              END AS new_impact
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
  return fetchBallot(roundId, address, category);
}

export const updateBallotProjectPosition = cache(
  updateBallotProjectPositionApi
);

const updateAllProjectsInBallotApi = async (
  projects: {
    project_id: string;
    allocation: string | null;
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
    project_id: string;
    allocation: string | null;
    impact: number;
  }[];
  category: string;
  roundId: number;
  address: string;
}) {
  const categoryProjects = await prismaWeb2Client.projectApplicants.findMany({
    where: {
      application_category: category,
    },
  });

  // check if all projects are valid
  const isValid =
    projects.every((project) =>
      categoryProjects.some(
        (categoryProject) =>
          categoryProject.application_id === project.project_id
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

  await Promise.all(
    projects.map((project, i) =>
      prismaWeb2Client.projectAllocations.upsert({
        where: {
          address_round_project_id: {
            project_id: project.project_id,
            round: roundId,
            address,
          },
        },
        update: {
          allocation: project.impact
            ? Number(project.allocation)?.toFixed(2)
            : null,
          impact: project.impact,
          rank: Math.floor((500_000 / projects.length) * (i + 1)),
          updated_at: new Date(),
        },
        create: {
          project_id: project.project_id,
          round: roundId,
          address,
          allocation: project.impact
            ? Number(project.allocation)?.toFixed(2)
            : null,
          impact: project.impact,
          rank: Math.floor((500_000 / projects.length) * (i + 1)),
        },
      })
    )
  );

  // Return full ballot
  return fetchBallot(roundId, address, category);
}

export const updateAllProjectsInBallot = cache(updateAllProjectsInBallotApi);
