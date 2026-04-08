import { test, chromium, BrowserContext, Page } from "@playwright/test";
import { ABRunnerEngine } from "./engine";

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

  const routesToDiff = [
    "/",
    "/delegates",
    "/proposals",
    // Can optionally read all available paths from the `sitemap.xml` or dynamically.
  ];

  for (const route of routesToDiff) {
    // Generate isolated tests
    test(`Diff pass/fail -> expected/diff for route "${route}"`, async () => {
      test.setTimeout(60000); // 1-minute timeout for cross-origin loading/rendering
      await engine.diffRoute(route, pageA, pageB);
    });
  }
});
