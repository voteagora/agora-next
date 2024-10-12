const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const metrics = require("../../dummy_metrics.json");

const categories = [
  "GOVERNANCE_INFRA_AND_TOOLING",
  "GOVERNANCE_ANALYTICS",
  "GOVERNANCE_LEADERSHIP",
];

async function main() {
  const projectMetrics = new Map();

  // Ittertate over the metrics array
  for (const metric of metrics) {
    console.log("metric", metric);
    // Build a map of project_id to all the metric data
    const name = metric.name;

    for (const [projectId, value] of Object.entries(metric.data)) {
      console.log(`${projectId}: ${value}`);

      if (!projectMetrics.has(projectId)) {
        projectMetrics.set(projectId, {});
      }

      projectMetrics.get(projectId)[name] = value;
    }
  }

  for (const [projectId, metrics] of projectMetrics) {
    console.log("projectId", projectId);
    console.log("metrics", metrics);

    // Pull corresponding project data from retro_funding.project_applicants_final

    const projectData = await prisma.projectApplicants.findFirst({
      where: {
        project_id: projectId,
        round: "5",
      },
    });

    if (!projectData) {
      console.error(`Project with id ${projectId} not found`);
      continue;
    }

    console.log("projectData", projectData);

    await prisma.projectApplicants.create({
      data: {
        ...projectData,
        application_id: "0x" + Math.random().toString(16).slice(2),
        round: "6",
        ipfs_data: {
          ...projectData.ipfs_data,
          impactMetrics: metrics,
        },
        application_category:
          categories[Math.floor(Math.random() * categories.length)],
        org_id: projectData.org_id || undefined,
        org_name: projectData.org_name || undefined,
        org_ipfs_data: projectData.org_ipfs_data || undefined,
        team: projectData.team || undefined,
      },
    });

    // Enrich the project data with the metric data and insert into the database under R6 flag
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
