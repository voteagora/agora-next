import fs from "fs";
import csv from "csv-parser";
import path from "path";
import iconv from "iconv-lite";

const TOTAL_FUNDING = 10_000_000;
const MAX_CAP = 500_000;
const MIN_CAP = 1000;

const METRICS_CSV_PATH = path.join(
  __dirname,
  "../../op_rf4_impact_metrics_by_project.csv"
);
const BALLOTS_CSV_PATH = path.join(__dirname, "../../ballots.csv");
const DESTINATION_CSV_PATH = path.join(__dirname, "../../results.csv");

const allocations = new Map<
  string,
  { project_id: string; is_os: boolean; value: number }[]
>();

interface Ballot {
  address: string;
  metric_id: string;
  os_multiplier: number;
  allocation: number;
  allocations: Allocation[];
}

interface Allocation {
  project_id: string;
  is_os: boolean;
  value: number;
}

interface BallotResponse {
  address: string;
  project_allocations: ProjectAllocation[];
}

interface ProjectAllocation {
  project_id: string;
  allocation: number;
}

// CSV Processing functions

function parseCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(iconv.decodeStream("utf-8"))
      .pipe(iconv.encodeStream("utf-8"))
      .pipe(csv())
      .on("data", (data: any) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error: any) => reject(error));
  });
}

async function processMetricsCSV(filePath: string) {
  let totals: { [metric: string]: number } = {};
  let rows: any[] = [];

  // First pass: Calculate totals
  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row: any) => {
        calculateTotals(row);
        rows.push(row); // Store rows for second pass
      })
      .on("end", async () => {
        console.log("Totals calculated:", totals);
        processRows();
        console.log("CSV file successfully processed");
        resolve();
      });
  });

  function calculateTotals(row: any) {
    for (const [metricName, value] of Object.entries(row)) {
      if (
        metricName !== "project_name" &&
        metricName !== "is_oss" &&
        metricName !== "application_id"
      ) {
        allocations.set(metricName, []);
        if (!totals[metricName]) {
          totals[metricName] = 0;
        }
        totals[metricName] += parseFloat(value as string);
      }
    }
  }

  function processRows() {
    for (const row of rows) {
      processRow(row);
    }
  }

  function processRow(row: any) {
    const projectName = row["application_id"];
    const isOS = row["is_oss"] === "true";

    for (const [metricName, value] of Object.entries(row)) {
      if (
        metricName !== "application_id" &&
        metricName !== "is_oss" &&
        metricName !== "project_name"
      ) {
        const total = totals[metricName];
        const linearValue = total ? parseFloat(value as string) / total : 0;

        allocations.get(metricName)?.push({
          project_id: projectName,
          is_os: isOS,
          value: linearValue,
        });
      }
    }
  }
}

// Allocation calculation functions

/**
 * Calculate the allocations for a single ballot
 * @param ballot
 */

function calculateAllocations(ballot: Ballot[]): BallotResponse {
  const projectTotals = new Map<string, number>();
  const projectData = new Map<string, any>();

  ballot.map((b) => {
    const metricId = b.metric_id;
    const adjustedValues = b.allocations.map((a) => {
      const value = a.is_os ? a.value * b.os_multiplier : a.value;
      return {
        ...a,
        value,
      };
    });

    const total = adjustedValues.reduce((acc, a) => acc + a.value, 0);

    return {
      address: b.address,
      metric_id: metricId,
      projectAllocations: adjustedValues.map((a) => {
        const data = projectData.get(a.project_id);
        projectData.set(a.project_id, {
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
          is_os: a.is_os,
          allocation: (a.value / total) * (b.allocation / 100),
        };
      }),
    };
  });

  const allocations = Array.from(projectData.entries())
    .map(([projectId, data]) => ({
      project_id: projectId,
      is_os: data.is_os,
      allocations_per_metric: data.allocations_per_metric,
      allocation: data.allocations_per_metric.reduce(
        (acc: number, a: { allocation: number }) => acc + a.allocation,
        0
      ),
    }))
    .sort((a, b) => b.allocation - a.allocation);

  const cappedAllocations = capAllocations(allocations);

  return {
    address: ballot[0].address,
    project_allocations: cappedAllocations,
  };
}

/**
 * Calculate the median allocations from a list of ballots
 * @param ballots List of ballots
 */

function calculateMedianAllocations(ballots: BallotResponse[]): any[] {
  const allocations: { [key: string]: number[] } = {};

  ballots.forEach((ballot) => {
    ballot.project_allocations.forEach((pa) => {
      if (!allocations[pa.project_id]) {
        allocations[pa.project_id] = [];
      }
      allocations[pa.project_id].push(pa.allocation);
    });
  });

  return Object.keys(allocations)
    .map((project_id) => ({
      project_id,
      allocation: median(allocations[project_id]),
    }))
    .sort((a, b) => b.allocation - a.allocation);
}

function applyMinCapAndNormalize(
  allocations: { project_id: string; allocation: number }[]
): { project_id: string; allocation: number }[] {
  // Normalize the allocations to total 10M. Skip projects with 500k or more
  const normalizedAllocations = normalizeAllocaitons(allocations);

  // Remove projects with < MIN_CAP allocation & redistribute to other projects
  // iterate over the projects in reverse order, find the first project with > 100 allocation. Record the pointer
  for (let i = normalizedAllocations.length - 1; i >= 0; i--) {
    if (normalizedAllocations[i].allocation > MIN_CAP) {
      // remove the projects with < 100 allocation
      normalizedAllocations.splice(i + 1);
      break;
    }
  }

  return normalizeAllocaitons(normalizedAllocations);
}

// Helper functions

function capAllocations<T extends { allocation: number }>(
  allocations: T[],
  cap: number = MAX_CAP / TOTAL_FUNDING,
  totalFunding: number = TOTAL_FUNDING
): T[] {
  let total = 1;
  let adjustedTotal = 1;
  return allocations.map((a) => {
    const cappedAllocation = Math.min(
      (a.allocation * adjustedTotal) / total,
      cap
    );
    total -= a.allocation;
    adjustedTotal -= cappedAllocation;
    return {
      ...a,
      allocation: cappedAllocation * totalFunding,
    };
  });
}

function normalizeAllocaitons<T extends { allocation: number }>(
  allocations: T[],
  cap: number = MAX_CAP,
  totalFunding: number = TOTAL_FUNDING
): T[] {
  let total = allocations.reduce((acc, a) => acc + a.allocation, 0);
  let adjustedTotal = totalFunding;
  return allocations.map((a) => {
    const adjustedAllocation = Math.min(
      (a.allocation * adjustedTotal) / total,
      cap
    );
    adjustedTotal -= adjustedAllocation;
    total -= a.allocation;
    return {
      ...a,
      allocation: adjustedAllocation,
    };
  });
}

function median(values: number[]): number {
  values.sort((a, b) => a - b);
  const half = Math.floor(values.length / 2);

  if (values.length % 2) return values[half];

  return (values[half - 1] + values[half]) / 2.0;
}

async function verifyMessage({
  address,
  message,
  signature,
}: {
  address: `0x${string}`;
  signature: `0x${string}`;
  message: string;
}) {
  const { optimism } = await import("wagmi/chains");
  const { createPublicClient } = await import("viem");
  const { http } = await import("viem");
  // Alchemy key
  const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID!;

  const publicClient = createPublicClient({
    chain: optimism,
    transport: http(`${optimism.rpcUrls.alchemy.http[0]}/${alchemyId}`),
  });

  return await publicClient.verifyMessage({
    address,
    message,
    signature,
  });
}

async function main() {
  // 0.a Load metrics file to get project allocations per metric
  await processMetricsCSV(METRICS_CSV_PATH);
  // 0.b Load and format ballots
  const ballots = await parseCSV(BALLOTS_CSV_PATH);

  // Assuming that the CSV data is mapped correctly to the Ballot interface
  const ballotAllocations = await Promise.all(
    ballots.map(async (row) => {
      const address = row["Address"];
      const payload = JSON.parse(row["Payload"]);
      const metricAllocations = payload["allocations"];
      const signature = row["Signature"];
      const os_multiplier = payload["os_multiplier"];

      // 1. Verify authenticity of each ballot
      const isValid = await verifyMessage({
        address,
        message: JSON.stringify(payload),
        signature,
      });

      if (!isValid) {
        throw new Error(`Invalid signature for ${address}`);
      }

      const ballot = metricAllocations.map((a: { [key: string]: number }) => {
        const [metric_id, allocation] = Object.entries(a)[0];
        return {
          address,
          metric_id,
          os_multiplier,
          os_only: false,
          allocation,
          allocations: allocations.get(metric_id) || [],
        };
      });

      // 2. Calculate project scores per badgeholder
      return calculateAllocations(ballot);
    })
  );

  // 3. Calculate the median allocations for all ballots
  const medianAllocations = calculateMedianAllocations(ballotAllocations);

  // 4. Eliminate small projects and normilize the allocation to 10M (keeping the 500k cap per project)
  const result = applyMinCapAndNormalize(medianAllocations);

  console.log("Smallest grantee: ", result[result.length - 1]);

  console.log(
    "Total funding:",
    result.reduce((acc, a) => acc + a.allocation, 0)
  );

  // Write the results to a CSV file
  fs.writeFileSync(
    DESTINATION_CSV_PATH,
    // convert result to csv
    result.map((r) => `${r.project_id},${r.allocation}`).join("\n")
  );
}

main().catch(console.error);
