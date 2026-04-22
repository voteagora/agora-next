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
  });

  const staticRoutes = [
    "/",
    "/delegates?orderBy=most_voting_power",
    "/proposals",
  ];

  test(`Cross-Tenant Guardrail: Verify identical DAO targets`, async () => {
    test.setTimeout(30000);
    const targetA = process.env.URL_A || "http://127.0.0.1:3000";
    const targetB = process.env.URL_B || "http://127.0.0.1:3000";

    await Promise.all([
      pageA.goto(targetA, { waitUntil: "commit" }).catch(() => {}),
      pageB.goto(targetB, { waitUntil: "commit" }).catch(() => {}),
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

    if (targetTypes.length > 0) {
      proposals = proposals.filter((p: any) => targetTypes.includes(String(p.proposal_type).toUpperCase()));
      // Bound execution: take only the 2 most recent proposals of each selected type
      const grouped: Record<string, any[]> = {};
      proposals.forEach((p: any) => {
        const type = String(p.proposal_type).toUpperCase();
        if (!grouped[type]) grouped[type] = [];
        if (grouped[type].length < 2) grouped[type].push(p);
      });
      proposals = Object.values(grouped).flat();
      console.log(`[Archive] Filtered to ${proposals.length} proposals (max 2 per type) matching types: [${targetTypes.join(", ")}]`);
    } else {
      // If no specific types or proposals requested, bound exhaustive run to 5 recent to prevent CI timeouts
      proposals = proposals.slice(0, 5);
      console.log(
        `[Archive] Bounded fallback: Loaded top ${proposals.length} recent proposals for tenant [${activeTenant}]`
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
        failedDrifts.push(`[${proposal.id}] Proposal Drifts Detected: ${e.message}`);
      }
    }

    if (failedDrifts.length > 0) {
      throw new Error(
        `Aggregated Visual Regressions Failed:\n${failedDrifts.join("\n\n")}`
      );
    }
  });
});
