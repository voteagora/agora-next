const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const applications = require("../../applications.json");

async function main() {
  const filePath = path.join(
    __dirname,
    "../../rf5_applicant_github_metrics.csv"
  ); // Replace 'your_file.csv' with the actual file name

  const applicants = await prisma.projectApplicants.findMany({
    where: {
      round: "5",
    },
    select: {
      application_id: true,
      ipfs_data: true,
    },
  });

  const projects = [];
  const metrics = new Map();

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      projects.push(row); // Store rows for second pass
    })
    .on("end", async () => {
      // console.log(projects);
      processRows();
      console.log(
        "CSV file successfully processed and data loaded to the database"
      );
      // console.log("metrics", metrics);
      await repairApplicationData();
      await prisma.$disconnect();
    });

  function processRows() {
    for (const project of projects) {
      processRow(project);
    }
  }

  function processRow(row) {
    const github = row["artifact_url"];

    for (const [metricName, value] of Object.entries(row)) {
      if (
        metricName !== "repo(s)" &&
        metricName !== "project_name" &&
        metricName !== "application_id" &&
        metricName !== "project_category_id"
      ) {
        if (!metrics.has(github)) {
          metrics.set(github, {});
        }
        if (metricName === "license(s)") {
          metrics.get(github)["license"] = value;
        } else {
          metrics.get(github)[metricName] = value;
        }
      }
    }
  }

  async function repairApplicationData() {
    const repairedApplications = applications.flatMap((application) => {
      const githubs = application.project.repos;
      for (const github of githubs) {
        if (metrics.has(github.url.toLowerCase())) {
          const data = metrics.get(github.url.toLowerCase());
          github.metrics = data;
        }
      }
      const currentApplication = applicants.find(
        (applicant) => applicant.application_id === application.attestationId
      );

      if (!currentApplication) {
        return [];
      }

      const investments = application.project.funding
        .filter((funding) => funding.type === "venture")
        .map((funding) => ({
          amount: funding.amount,
          year: funding.receivedAt,
          details: funding.details,
        }));
      const revenue = application.project.funding
        .filter((funding) => funding.type === "revenue")
        .map((funding) => ({
          amount: funding.amount,
          details: funding.details,
        }));
      const grants = application.project.funding
        .filter(
          (funding) => funding.type !== "venture" && funding.type !== "revenue"
        )
        .map((funding) => ({
          grant: funding.grant || funding.type,
          link: funding.grantUrl,
          amount: funding.amount,
          date: funding.receivedAt,
          details: funding.details,
          fundingRound: funding.fundingRound,
        }));

      return [
        {
          applicationId: application.attestationId,
          ipfs_data: {
            ...currentApplication.ipfs_data,
            github: githubs,
            grantsAndFunding: {
              investments,
              revenue,
              grants,
            },
            pricingModel: {
              type: application.project.pricingModel,
              details: application.project.pricingModelDetails,
            },
            team: application.project.team,
          },
        },
      ];
    });

    for (const repairedApplication of repairedApplications) {
      console.log("repairedApplication", repairedApplication);
      await prisma.projectApplicants.update({
        where: {
          application_id: repairedApplication.applicationId,
        },
        data: {
          ipfs_data: repairedApplication.ipfs_data,
        },
      });
    }
  }
}

main();
