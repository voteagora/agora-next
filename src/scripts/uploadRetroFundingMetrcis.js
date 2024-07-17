const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(
    __dirname,
    "../../op_rf4_impact_metrics_by_project.csv"
  ); // Replace 'your_file.csv' with the actual file name

  let totals = {};
  let rows = [];

  // First pass: Calculate totals
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      calculateTotals(row);
      rows.push(row); // Store rows for second pass
    })
    .on("end", async () => {
      console.log("Totals calculated:", totals);
      await processRows();
      console.log(
        "CSV file successfully processed and data loaded to the database"
      );
      await prisma.$disconnect();
    });

  function calculateTotals(row) {
    for (const [metricName, value] of Object.entries(row)) {
      if (metricName !== "project_name") {
        if (!totals[metricName]) {
          totals[metricName] = 0;
        }
        totals[metricName] += parseFloat(value);
      }
    }
  }

  // TODO: Split into batches to speed up the load

  async function processRows() {
    for (const row of rows) {
      await processRow(row);
    }
  }

  async function processRow(row) {
    const projectName = row["application_id"];
    const isOS = row["is_oss"] === "true";
    for (const [metricName, value] of Object.entries(row)) {
      if (
        metricName !== "application_id" &&
        metricName !== "is_oss" &&
        metricName !== "project_name"
      ) {
        const total = totals[metricName];
        const linearValue = total ? parseFloat(value) / total : 0;

        console.log(
          `Updating data for project ${projectName}, metric ${metricName}, value ${value}, linearValue ${linearValue}, isOS ${isOS}`
        );

        // Insert the data into the database using Prisma
        await prisma.metrics_projects.update({
          data: {
            is_os: isOS,
            allocation: linearValue,
            values: Number(value),
          },
          where: {
            metric_id_project_id: {
              project_id: projectName,
              metric_id: metricName,
            },
          },
        });
      }
    }
  }
}

main();
