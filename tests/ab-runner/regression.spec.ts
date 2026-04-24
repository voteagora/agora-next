import { test, chromium, BrowserContext, Page } from "@playwright/test";
import { ABRunnerEngine } from "./engine";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { TENANT_NAMESPACES } from "../../src/lib/constants";
import { fetchProposalsFromArchive } from "../../src/lib/archiveUtils";

dotenv.config();

test.describe("Visual Regression A/B Diff Runner", () => {
  let engine: ABRunnerEngine;
  let contextA: BrowserContext;
  let contextB: BrowserContext;
  let pageA: Page;
  let pageB: Page;

  test.beforeAll(async () => {
    engine = new ABRunnerEngine();
    const browser = await chromium.launch();

    // We launch two completely separate contexts to ensure cookies/localStorage
    // never infect one another during the dual-crawl.
    contextA = await browser.newContext();
    contextB = await browser.newContext();

    pageA = await contextA.newPage();
    pageB = await contextB.newPage();
  });

  test.afterAll(async () => {
    await contextA.close();
    await contextB.close();

    // Generate manifest.json for local dashboard viewing
    const abDiffsDir = path.join(process.cwd(), "test-results", "ab-diffs");
    if (fs.existsSync(abDiffsDir)) {
      const reports: { path: string; images: string[] }[] = [];
      const getDirs = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const res = path.resolve(dir, entry.name);
          if (entry.isDirectory()) {
            getDirs(res);
          } else if (entry.name === "report.json") {
            const relPath = path.relative(abDiffsDir, res);
            const parentDir = path.dirname(res);
            const images = fs
              .readdirSync(parentDir)
              .filter((f) => f.endsWith(".png"));
            reports.push({ path: relPath, images });
          }
        }
      };
      getDirs(abDiffsDir);
      fs.writeFileSync(
        path.join(abDiffsDir, "manifest.json"),
        JSON.stringify({ reports }, null, 2)
      );
    }
  });

  const delegatesSortBy =
    process.env.TARGET_DELEGATES_SORT_BY || "most_voting_power";

  // Route scope mapping — controlled by TARGET_ROUTES env var (from CI checkboxes)
  const routeMap: Record<string, string> = {
    index: "/",
    delegates: `/delegates?orderBy=${delegatesSortBy}`,
    proposals: "/proposals",
  };

  const targetRoutes = (process.env.TARGET_ROUTES || "")
    .split(",")
    .map((r) => r.trim().toLowerCase())
    .filter((r) => r.length > 0);

  const staticRoutes =
    targetRoutes.length > 0
      ? targetRoutes.filter((r) => routeMap[r]).map((r) => routeMap[r])
      : Object.values(routeMap); // default: all routes

  test(`Cross-Tenant Guardrail: Verify identical DAO targets`, async () => {
    test.setTimeout(60000);
    const targetA = process.env.URL_A || "http://127.0.0.1:3000";
    const targetB = process.env.URL_B || "http://127.0.0.1:3000";

    await Promise.all([
      pageA.goto(targetA, { waitUntil: "commit", timeout: 20000 }),
      pageB.goto(targetB, { waitUntil: "commit", timeout: 20000 }),
    ]);
    await Promise.all([
      pageA
        .waitForFunction(() => document.title.length > 0, { timeout: 15000 })
        .catch(() => {}),
      pageB
        .waitForFunction(() => document.title.length > 0, { timeout: 15000 })
        .catch(() => {}),
    ]);

    const titleA = (await pageA.title()).toLowerCase();
    const titleB = (await pageB.title()).toLowerCase();

    // Look for primary tenant identities (optimism vs uniswap)
    const isUnimatch =
      (titleA.includes("uniswap") && titleB.includes("optimism")) ||
      (titleA.includes("optimism") && titleB.includes("uniswap"));
    if (isUnimatch || (titleA && titleB && titleA !== titleB)) {
      throw new Error(
        `ABORTED: Cross-Tenant comparison detected. You cannot compare mathematically two different DAOs: [${titleA}] vs [${titleB}]`
      );
    }
  });

  for (const route of staticRoutes) {
    test(`Diff pass/fail -> expected/diff for static route "${route}"`, async () => {
      test.setTimeout(900000); // 15.0m to compensate for GitHub CI CPU limits on infinite scrolls
      await engine.diffRoute(route, pageA, pageB);
    });
  }

  // === Explicit Targeted/Manual Regression ===
  // E.g.: `TARGET_PROPOSALS="116,423" TARGET_DELEGATES="0x123...456" npm run test:ab`
  const explicitProposals = (process.env.TARGET_PROPOSALS || "")
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (explicitProposals.length > 0) {
    for (const proposalId of explicitProposals) {
      test(`Diff pass/fail -> expected/diff for specific explicitly targeted proposal "/proposals/${proposalId}"`, async () => {
        test.setTimeout(900000);
        await engine.diffRoute(`/proposals/${proposalId}`, pageA, pageB);
      });
    }
  }

  // === Targeted Proposal Types Regression ===
  // E.g.: `TARGET_TYPES="STANDARD,APPROVAL" npm run test:ab`
  const targetTypes = (process.env.TARGET_TYPES || "")
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter((t) => t.length > 0);

  // === GCS Archive Proposals Regression ===
  // Fetches all proposals from the archive and runs a diff for each proposal ID.
  if (explicitProposals.length === 0) {
    test(`Diff pass/fail -> expected/diff for all archived proposals`, async () => {
      test.setTimeout(0); // No timeout — scales with number of proposals in archive

      const targetA = process.env.URL_A || "http://127.0.0.1:3000";
      const activeTenant =
        Object.values(TENANT_NAMESPACES).find((ns) =>
          targetA.toLowerCase().includes(ns.toLowerCase())
        ) || TENANT_NAMESPACES.OPTIMISM;

      let { data: proposals } = await fetchProposalsFromArchive(
        activeTenant,
        "relevant"
      );

      // Filter out snapshot proposals because they don't have a detail page on Agora
      // and redirect to snapshot.org, which would break the visual regression scanner.
      proposals = proposals.filter(
        (p: any) => String(p.proposal_type).toUpperCase() !== "SNAPSHOT"
      );

      if (targetTypes.length > 0) {
        const limitedProposals: any[] = [];
        const typesCount: Record<string, number> = {};

        for (const p of proposals) {
          let rawType = String(
            p.proposal_type || p.proposal_type_info?.name || "UNDEFINED"
          ).toUpperCase();

          let t = "UNDEFINED";
          if (rawType.includes("OPTIMISTIC")) t = "OPTIMISTIC";
          else if (rawType.includes("APPROVAL")) t = "APPROVAL";
          else if (
            rawType.includes("STANDARD") ||
            rawType.includes("DEFAULT") ||
            rawType.includes("SUPERMAJORITY")
          ) {
            t = "STANDARD";
          }

          if (targetTypes.includes(t)) {
            typesCount[t] = (typesCount[t] || 0) + 1;
            // Only keep up to 1 of each type to prevent massive loops, unless overridden
            const limit = Number(process.env.TARGET_TYPES_LIMIT || "1");
            if (typesCount[t] <= limit) {
              limitedProposals.push(p);
            }
          }
        }
        proposals = limitedProposals;

        console.log(
          `[Archive] Filtered to ${proposals.length} proposals matching types: [${targetTypes.join(", ")}] (Limit per type: ${process.env.TARGET_TYPES_LIMIT || "1"})`
        );
      } else {
        // If no specific types or proposals requested, run on all available proposals
        console.log(
          `[Archive] Unbounded fallback: Loaded all ${proposals.length} recent proposals for tenant [${activeTenant}]`
        );
      }

      const failedDrifts: string[] = [];

      for (const proposal of proposals) {
        const pRoute = `/proposals/${proposal.id}`;
        console.log(`[Archive] Testing Proposal [${proposal.id}]: ${pRoute}`);
        try {
          await engine.diffRoute(pRoute, pageA, pageB, {
            tenant: activeTenant,
            type: String(proposal.proposal_type),
          });
        } catch (e: any) {
          failedDrifts.push(
            `[${proposal.id}] Proposal Drifts Detected: ${e.message}`
          );
        }
      }

      if (failedDrifts.length > 0) {
        throw new Error(
          `Aggregated Visual Regressions Failed:\n${failedDrifts.join("\n\n")}`
        );
      }
    });
  }
});
