import { loadConfig } from "./loadTestConfig";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { Tenant, Config } from "../test.types";

function findTestFiles(pattern: string, dir: string): string[] {
  let results: string[] = [];

  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(findTestFiles(pattern, filePath));
    } else if (file.endsWith(pattern)) {
      results.push(filePath);
    }
  });

  return results;
}

function runTestsForTenant(tenant: Tenant) {
  console.log(`Running tests for tenant: ${tenant.name}`);

  // Set environment variables for the current tenant
  Object.keys(tenant.env).forEach((key) => {
    process.env[key] = tenant.env[key as keyof typeof tenant.env];
  });

  const tenantInstanceName = process.env.NEXT_PUBLIC_AGORA_INSTANCE_NAME;

  // Search the tests directory for test files
  const testFiles = findTestFiles(
    `${tenantInstanceName}.test.ts`,
    path.join(__dirname, "..", "..", "tests")
  );

  console.log(`Found test files for ${tenant.name}:`, testFiles); // Debugging output

  if (testFiles.length === 0) {
    console.log(`No test files found for tenant: ${tenant.name}`);
  }

  try {
    // Execute the tests we found
    testFiles.forEach((file) => {
      console.log(`Running test: ${file}`);
      execSync(`npx jest ${file} --config jest.config.js`, {
        stdio: "inherit",
      });
    });

    return { tenant: tenant.name, status: "passed" };
  } catch (error) {
    return { tenant: tenant.name, status: "failed" };
  }
}

// Main loop for test runner
async function main() {
  const config: Config = loadConfig() as Config;
  const results = [];

  for (const tenant of config.tenants) {
    const result = runTestsForTenant(tenant);
    results.push(result);

    if (result.status === "failed") {
      console.log(`Tests failed for tenant: ${tenant.name}`);
      process.exit(1);
    }
  }

  console.log("Test Results:", results);

  if (results.some((result) => result.status === "failed")) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Error in main:", error);
  process.exit(1);
});
