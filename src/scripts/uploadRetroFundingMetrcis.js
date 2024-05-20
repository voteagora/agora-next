const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(
    __dirname,
    "../../bquxjob_4f088de5_18f81c0ada6.csv"
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

  async function processRows() {
    for (const row of rows) {
      await processRow(row);
    }
  }

  async function processRow(row) {
    const projectName = row["project_name"];
    const isOS = Math.random() < 0.5; // Randomly assign true or false
    for (const [metricName, value] of Object.entries(row)) {
      if (metricName !== "project_name") {
        const total = totals[metricName];
        const linearValue = total ? parseFloat(value) / total : 0;

        // Insert the data into the database using Prisma
        await prisma.metrics_projects.create({
          data: {
            metric_id: metricName,
            project_id: projectName,
            is_os: isOS,
            allocation: linearValue,
            values: Number(value),
          },
        });
      }
    }
  }
}

main();
