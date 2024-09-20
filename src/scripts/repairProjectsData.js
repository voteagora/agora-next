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
    const github = row["repo(s)"].split(",")[0];

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
          metrics.get(github)["license"] = value.split(",")[0];
        } else {
          metrics.get(github)[metricName] = value;
        }
      }
    }
  }

  async function repairApplicationData() {
    const repairedApplications = applications.map((application) => {
      const githubs = application.github;
      for (const github of githubs) {
        if (metrics.has(github.url)) {
          const data = metrics.get(github.url);
          github.metrics = data;
        }
      }
      const currentApplication = applicants.find(
        (applicant) => applicant.application_id === application.applicationId
      );
      return {
        applicationId: application.applicationId,
        ipfs_data: {
          ...currentApplication.ipfs_data,
          github: githubs,
          grantsAndFunding: application.grantsAndFunding,
        },
      };
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
