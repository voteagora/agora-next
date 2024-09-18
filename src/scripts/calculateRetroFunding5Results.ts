import fs from "fs";
const csv = require("csv-parser");
const path = require("path");
const iconv = require("iconv-lite");

const MAX_CAP = 500_000;
const MIN_CAP = 1000;

const BALLOTS_JSON = require(path.join(__dirname, "../../ballots.json"));
const DESTINATION_CSV_PATH = path.join(__dirname, "../../results.csv");

interface BallotResponse {
  project_allocations: { [key: string]: number };
  category_allocations: { [key: string]: number };
  budget: number;
  category: string;
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

/**
 * Calculate the median allocations from a list of ballots
 * @param ballots List of ballots
 */

function calculateMedianAllocations(ballots: BallotResponse[]) {
  const projectAllocations: { [key: string]: { [key: string]: number[] } } = {};
  const categoryAllocations: { [key: string]: number[] } = {};
  const medianBudget = median(ballots.map((b) => b.budget));

  ballots.forEach((ballot) => {
    if (!projectAllocations[ballot.category]) {
      projectAllocations[ballot.category] = {};
    }
    Object.entries(ballot.project_allocations).forEach(
      ([project_id, allocation]) => {
        if (!projectAllocations[ballot.category][project_id]) {
          projectAllocations[ballot.category][project_id] = [];
        }
        projectAllocations[ballot.category][project_id].push(allocation);
      }
    );
    Object.entries(ballot.category_allocations).forEach(
      ([category_id, allocation]) => {
        if (!categoryAllocations[category_id]) {
          categoryAllocations[category_id] = [];
        }
        categoryAllocations[category_id].push(allocation);
      }
    );
  });

  // returns an object containing medians of all params

  const medianCategoryAllocations = normalizeAllocaitons(
    Object.keys(categoryAllocations)
      .map((category) => ({
        category,
        allocation: median(categoryAllocations[category]),
      }))
      .sort((a, b) => b.allocation - a.allocation),
    100,
    100
  ); // Normalize to 100%

  const medianProjectAllocations = Object.entries(projectAllocations)
    .flatMap(([category, pa]) => {
      const categoryAllocation = medianCategoryAllocations.find(
        (ca) => ca.category === category
      )!.allocation;

      return normalizeAllocaitons(
        Object.keys(pa)
          .map((project_id) => ({
            project_id,
            allocation: median(pa[project_id]),
          }))
          .sort((a, b) => b.allocation - a.allocation),
        100,
        100
      ) // Normalize to 100%
        .map((pa) => ({
          project_id: pa.project_id,
          allocation:
            (pa.allocation * categoryAllocation * medianBudget) / 10000,
        }));
    })
    .sort((a, b) => b.allocation - a.allocation);

  console.log("Median budget: ", medianBudget);
  console.log("Median project allocations: ", medianProjectAllocations);

  return { medianProjectAllocations, medianBudget };
}

function applyMinCapAndNormalize(
  allocations: { project_id: string; allocation: number }[],
  totalFunding: number
): { project_id: string; allocation: number }[] {
  // Normalize the allocations to total 10M. Skip projects with 500k or more
  const normalizedAllocations = normalizeAllocaitons(
    allocations,
    MAX_CAP,
    totalFunding
  );

  // Remove projects with < MIN_CAP allocation & redistribute to other projects
  // iterate over the projects in reverse order, find the first project with > 100 allocation. Record the pointer
  for (let i = normalizedAllocations.length - 1; i >= 0; i--) {
    if (normalizedAllocations[i].allocation > MIN_CAP) {
      // remove the projects with < 100 allocation
      normalizedAllocations.splice(i + 1);
      break;
    }
  }

  return normalizeAllocaitons(normalizedAllocations, MAX_CAP, totalFunding);
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
  cap: number,
  totalFunding: number
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
  // 0 Load and format ballots
  const ballots = BALLOTS_JSON;

  // Assuming that the CSV data is mapped correctly to the Ballot interface
  const ballotAllocations = await Promise.all(
    ballots.map(async (ballot) => {
      const address = ballot.voter_id;
      // const payload = JSON.parse(row["Payload"]);
      // const category_allocations = payload["category_allocations"] as {
      //   [key: string]: number;
      // }[];
      // const project_allocations = payload["project_allocations"] as {
      //   [key: string]: number;
      // }[];
      // const budget = payload["budget"] as number;
      // const category = payload["category_assignment"] as string;
      // const signature = row["Signature"];

      const category_allocations = ballot.category_allocations;
      const project_allocations = ballot.project_allocations;
      const budget = ballot.budget;
      const category = ballot.category_assignment;

      // // 1. Verify authenticity of each ballot
      // const isValid = await verifyMessage({
      //   address,
      //   message: JSON.stringify(payload),
      //   signature,
      // });

      // if (!isValid) {
      //   throw new Error(`Invalid signature for ${address}`);
      // }

      return {
        budget,
        category_allocations,
        project_allocations,
        category,
      };
    })
  );

  // 2. Calculate the median allocations for all properties
  const { medianProjectAllocations, medianBudget } =
    calculateMedianAllocations(ballotAllocations);

  // 4. Eliminate small projects and normilize the allocation to BUDGET (keeping the 500k cap per project)
  const result = applyMinCapAndNormalize(
    medianProjectAllocations,
    medianBudget
  );

  console.log("Smallest grantee: ", result[result.length - 1]);

  console.log(
    "Total funding:",
    result.reduce((acc, a) => acc + a.allocation, 0)
  );

  console.log("Total projects:", result.length);

  // Write the results to a CSV file
  fs.writeFileSync(
    DESTINATION_CSV_PATH,
    // convert result to csv
    result.map((r) => `${r.project_id},${r.allocation}`).join("\n")
  );
}

main().catch(console.error);
