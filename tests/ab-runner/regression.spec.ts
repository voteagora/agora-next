import { test, chromium, BrowserContext, Page } from "@playwright/test";
import { ABRunnerEngine } from "./engine";
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

  // === GCS Archive Proposals Regression ===
  // Fetches all proposals from the archive and runs a diff for each proposal ID.
  test(`Diff pass/fail -> expected/diff for all archived proposals`, async () => {
    test.setTimeout(0); // No timeout — scales with number of proposals in archive

    const targetA = process.env.URL_A || "http://127.0.0.1:3000";
    const activeTenant =
      Object.values(TENANT_NAMESPACES).find((ns) =>
        targetA.toLowerCase().includes(ns.toLowerCase())
      ) || TENANT_NAMESPACES.OPTIMISM;

    const { data: proposals } = await fetchProposalsFromArchive(
      activeTenant,
      "relevant"
    );
    console.log(
      `[Archive] Loaded ${proposals.length} proposals for tenant [${activeTenant}]`
    );

    const failedDrifts: string[] = [];

    for (const proposal of proposals) {
      const route = `/proposals/${proposal.id}`;
      console.log(`[Archive] Testing proposal: ${route}`);
      try {
        await engine.diffRoute(route, pageA, pageB);
      } catch (e: any) {
        failedDrifts.push(`[${proposal.id}] ${e.message}`);
      }
    }

    if (failedDrifts.length > 0) {
      throw new Error(
        `Aggregated Visual Regressions Failed:\n${failedDrifts.join("\n\n")}`
      );
    }
  });

  test(`Diff pass/fail -> expected/diff for all proposal ids from proposals index`, async () => {
    test.setTimeout(0); // No timeout — scales with number of proposals discovered
    const targetA = process.env.URL_A || "http://127.0.0.1:3000";

    console.log(
      `[Dynamic] Scraping DOM for all proposal ids from ${targetA}/proposals...`
    );

    const activeTenant =
      Object.values(TENANT_NAMESPACES).find((ns) =>
        targetA.toLowerCase().includes(ns.toLowerCase())
      ) || TENANT_NAMESPACES.OPTIMISM;

    let proposalRoutes: string[] = [];

    try {
      await pageA.goto(`${targetA}/proposals`, { waitUntil: "commit" });
      await pageA
        .waitForSelector('a[href*="/proposals/"]', { timeout: 20000 })
        .catch(() => {});

      const res = await pageA.evaluate(async () => {
        const reservedSegments = new Set([
          "create-proposal",
          "draft",
          "sponsor",
        ]);
        const routes = new Set<string>();
        let iterations = 0;
        let stableRounds = 0;
        let previousCount = 0;

        while (iterations < 12) {
          const cards = Array.from(
            document.querySelectorAll('a[href*="/proposals/"]')
          ).filter((a) => {
            const h = a.getAttribute("href") || "";
            return h.includes("/proposals/");
          });

          cards.forEach((card) => {
            const href = card.getAttribute("href") as string;
            const match = href.match(
              /^\/proposals\/([^/?#]+)(?:[?#].*)?$/
            );
            if (!match) return;

            const proposalId = match[1];
            if (reservedSegments.has(proposalId)) return;
            routes.add(`/proposals/${proposalId}`);
          });

          window.scrollTo(0, document.body.scrollHeight);
          await new Promise((r) => setTimeout(r, 1500));

          if (routes.size === previousCount) {
            stableRounds++;
            if (stableRounds >= 2) break;
          } else {
            stableRounds = 0;
          }

          previousCount = routes.size;
          iterations++;
        }

        return {
          routes: Array.from(routes),
          totalCards: document.querySelectorAll('a[href*="/proposals/"]')
            .length,
        };
      });

      proposalRoutes = res.routes;
      console.log(
        `[Dynamic] Extracted ${res.totalCards} raw proposals from DOM.`
      );
      console.log(
        `[Dynamic] Discovered ${proposalRoutes.length} unique proposal routes.`
      );
    } catch (e) {
      console.error(
        "[Dynamic] Error extracting proposal routes. Skipping extraction.",
        e
      );
    }

    // Execute sequentially and Aggregate failures so we never break the loop early
    const failedDrifts: string[] = [];

    if (proposalRoutes.length === 0) {
      throw new Error(
        `[Dynamic] No proposal routes discovered on ${targetA}/proposals`
      );
    }

    for (const pRoute of proposalRoutes) {
      const proposalId = pRoute.split("/").filter(Boolean).pop();
      if (!proposalId) {
        failedDrifts.push(
          `[Dynamic] Unable to derive proposal ID from route: ${pRoute}`
        );
        continue;
      }
      console.log(`[Dynamic] Testing proposal [${proposalId}]: ${pRoute}`);
      try {
        await engine.diffRoute(pRoute, pageA, pageB, {
          tenant: activeTenant,
          proposalId,
        });
      } catch (e: any) {
        failedDrifts.push(`[${proposalId}] ${e.message}`);
      }
    }

    if (failedDrifts.length > 0) {
      throw new Error(
        `Aggregated Visual Regressions Failed:\n${failedDrifts.join("\n\n")}`
      );
    }
  });
});
