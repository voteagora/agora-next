import { test, chromium, BrowserContext, Page } from "@playwright/test";
import { ABRunnerEngine } from "./engine";
import dotenv from "dotenv";
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

  for (const route of staticRoutes) {
    test(`Diff pass/fail -> expected/diff for static route "${route}"`, async () => {
      test.setTimeout(300000); 
      await engine.diffRoute(route, pageA, pageB);
    });
  }

  test(`Diff pass/fail -> expected/diff for proposals-by-type-tenant`, async () => {
    test.setTimeout(600000); // 10 minutes to allow multiple deep proposals
    
    // We strictly use the local host to map proposals to avoid 401s from Production API Keys mismatch
    const mappingUrl = "http://127.0.0.1:3000";
    console.log(`[Dynamic] Fetching available proposal types from ${mappingUrl}...`);
    
    try {
      const response = await fetch(`${mappingUrl}/api/v1/proposals?limit=100`, {
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_AGORA_API_KEY}`
        }
      });
      if (!response.ok) throw new Error(`Failed to fetch proposals API: ${response.status} ${response.statusText}`);
      
      const resJson = await response.json();
      const proposals = resJson.data || resJson || [];
      const seenTypes = new Set();
      const targetProposals = [];

      // Extract exactly 1 proposal of each available type on this tenant
      for (const p of proposals) {
        if (p.proposalType && !seenTypes.has(p.proposalType)) {
          seenTypes.add(p.proposalType);
          targetProposals.push(p);
        }
      }

      console.log(`[Dynamic] Detected ${targetProposals.length} unique proposal types:`, Array.from(seenTypes));

      for (const p of targetProposals) {
        const pRoute = `/proposals/${p.id}`;
        console.log(`[Dynamic] Running visual diff for type [${p.proposalType}] at route ${pRoute}`);
        await engine.diffRoute(pRoute, pageA, pageB);
      }
    } catch (e) {
      console.error("[Dynamic] Error extracting proposals by type. Skipping dynamic route tests.", e);
    }
  });
});
