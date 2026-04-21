import { test, chromium, BrowserContext, Page } from "@playwright/test";
import { ABRunnerEngine } from "./engine-v2";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { TENANT_NAMESPACES } from "../../src/lib/constants";

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

  test(`Diff pass/fail -> expected/diff for proposals-by-type-tenant`, async () => {
    test.setTimeout(600000); // 10 minutes to allow multiple deep proposals
    const targetA = process.env.URL_A || "http://127.0.0.1:3000";

    console.log(
      `[Dynamic] Scraping DOM for available proposal types from ${targetA}/proposals...`
    );

    // Dynamically detect tenant namespace and extract its configured proposal types
    let activeTenant =
      Object.values(TENANT_NAMESPACES).find((ns) =>
        targetA.toLowerCase().includes(ns.toLowerCase())
      ) || TENANT_NAMESPACES.OPTIMISM;

    // Natively read the TS config file to bypass Playwright's Babel/SVG loader limitations
    let dynamicTypes = ["STANDARD"];
    try {
      const configPath = path.join(
        __dirname,
        `../../src/lib/tenant/configs/ui/${activeTenant}.ts`
      );
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, "utf-8");
        const match = content.match(/proposalTypes:\s*\[([\s\S]*?)\]/);
        if (match) {
          dynamicTypes = Array.from(
            match[1].matchAll(/type:\s*["']([^"']+)["']/g)
          ).map((m) => {
            let name = m[1].toUpperCase();
            return name === "BASIC" ? "STANDARD" : name;
          });
        }
      }
    } catch (e) {
      console.warn(
        `[Dynamic] Could not parse TS config for ${activeTenant}, defaulting to [STANDARD]`
      );
    }

    // Ensure generic STANDARD fallback if empty
    const searchTargets = dynamicTypes.length > 0 ? dynamicTypes : ["STANDARD"];
    console.log(
      `[Dynamic] Detected Tenant: [${activeTenant}]. Extracting native UI typologies: [${searchTargets.join(", ")}]`
    );

    let proposalsByType: Record<string, string> = {};

    try {
      await pageA.goto(`${targetA}/proposals`, { waitUntil: "commit" });
      await pageA
        .waitForSelector('a[href*="/proposals/"]', { timeout: 20000 })
        .catch(() => {});

      const res = await pageA.evaluate(async (expectedTypes) => {
        const map: Record<string, string> = {};
        let iterations = 0;

        while (
          Object.keys(map).length < expectedTypes.length &&
          iterations < 8
        ) {
          const cards = Array.from(
            document.querySelectorAll('a[href*="/proposals/"]')
          ).filter((a) => {
            const h = a.getAttribute("href") || "";
            return /\/proposals\/([0-9a-zA-Z_-]{2,})/.test(h);
          });

          cards.forEach((card) => {
            const href = card.getAttribute("href") as string;
            const text = ((card as HTMLElement).innerText || "").toUpperCase();

            let typeText = "STANDARD";
            expectedTypes.forEach((targetType: string) => {
              if (text.includes(targetType)) typeText = targetType;
            });

            if (!map[typeText]) {
              map[typeText] = href;
            }
          });

          if (Object.keys(map).length >= expectedTypes.length) break;
          window.scrollTo(0, document.body.scrollHeight);
          await new Promise((r) => setTimeout(r, 1500));
          iterations++;
        }

        return {
          map,
          totalCards: document.querySelectorAll('a[href*="/proposals/"]')
            .length,
        };
      }, searchTargets);

      proposalsByType = res.map;
      console.log(
        `[Dynamic] Extracted ${res.totalCards} raw proposals from DOM.`
      );
      console.log(
        `[Dynamic] Mapping matrix generated natively:`,
        JSON.stringify(proposalsByType, null, 2)
      );
    } catch (e) {
      console.error(
        "[Dynamic] Error extracting proposals by type. Skipping extraction.",
        e
      );
    }

    // Execute sequentially and Aggregate failures so we never break the loop early
    const failedDrifts: string[] = [];

    for (const ptype of searchTargets) {
      if (!proposalsByType[ptype]) {
        console.log(
          `[Dynamic] Missing native proposal type in production: [${ptype}]`
        );
        const artifactsDir = path.join(
          process.cwd(),
          "test-results",
          "ab-diffs",
          "optimism",
          "proposals",
          ptype
        );
        fs.mkdirSync(artifactsDir, { recursive: true });
        fs.writeFileSync(
          path.join(artifactsDir, "report.json"),
          JSON.stringify({ error: "No proposals found of this type" }, null, 2)
        );
        continue;
      }

      const pRoute = proposalsByType[ptype];
      console.log(`[Dynamic] Testing Proposal Type [${ptype}]: ${pRoute}`);
      try {
        await engine.diffRoute(pRoute, pageA, pageB, {
          tenant: activeTenant,
          type: ptype,
        });
      } catch (e: any) {
        failedDrifts.push(`[${ptype}] Proposal Drifts Detected: ${e.message}`);
      }
    }

    if (failedDrifts.length > 0) {
      throw new Error(
        `Aggregated Visual Regressions Failed:\n${failedDrifts.join("\n\n")}`
      );
    }
  });
});
