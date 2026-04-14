import { test, expect, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

export interface OverrideConfig {
  ignoreSelectors?: string[];
  expectDiff?: boolean;
  reason?: string;
}

export class ABRunnerEngine {
  private urlA: string;
  private urlB: string;
  private overrides: Record<string, OverrideConfig>;

  constructor() {
    this.urlA = process.env.URL_A || "http://127.0.0.1:3000";
    this.urlB = process.env.URL_B || "http://127.0.0.1:3000";

    const overridesPath = path.join(__dirname, "overrides.json");
    if (fs.existsSync(overridesPath)) {
      this.overrides = JSON.parse(fs.readFileSync(overridesPath, "utf-8"));
    } else {
      this.overrides = { routes: {}, general: {} };
    }
  }

  async diffRoute(route: string, pageA: Page, pageB: Page) {
    const override = this.getOverride(route);

    const targetA =
      this.urlA.replace(/\/$/, "") +
      (route.startsWith("/") ? route : `/${route}`);
    const targetB =
      this.urlB.replace(/\/$/, "") +
      (route.startsWith("/") ? route : `/${route}`);

    await Promise.all([
      pageA.goto(targetA, { waitUntil: "commit" }).catch(() => {}),
      pageB.goto(targetB, { waitUntil: "commit" }).catch(() => {}),
    ]);

    await Promise.all([
      pageA.waitForSelector("body", { timeout: 15000 }).catch(() => {}),
      pageB.waitForSelector("body", { timeout: 15000 }).catch(() => {}),
    ]);

    // Hide sticky toolbars like Vercel Live Preview which shift local footers
    const globalHide = `vercel-live-feedback, #vercel-live-button, #vercel-live-feedback { display: none !important; opacity: 0 !important; visibility: hidden !important; }`;
    await pageA.addStyleTag({ content: globalHide }).catch(() => {});
    await pageB.addStyleTag({ content: globalHide }).catch(() => {});

    if (override.ignoreSelectors && override.ignoreSelectors.length > 0) {
      const maskStyles =
        override.ignoreSelectors.join(", ") +
        " { opacity: 0 !important; visibility: hidden !important; }";
      await Promise.all([
        pageA.addStyleTag({ content: maskStyles }),
        pageB.addStyleTag({ content: maskStyles }),
      ]);
    }

    // 1. Trigger infinite loaders via progressive scroll, then fit viewport accurately
    await Promise.all([
      this.progressiveScroll(pageA),
      this.progressiveScroll(pageB),
    ]);

    // 2. Extract DOM Trees
    const treeA = await this.extractDOMTree(pageA);
    const treeB = await this.extractDOMTree(pageB);

    // 3. Compare the trees
    const drifts: any[] = [];
    const reportList: any[] = [];

    const mapB = new Map(treeB.map((n: any) => [n.path, n]));

    for (const nodeA of treeA) {
      if (!nodeA) continue;
      const nodeB = mapB.get(nodeA.path);

      let isDrifted = false;
      let driftReason = "";

      if (!nodeB) {
        isDrifted = true;
        driftReason = "Missing or Moved Component";
      } else {
        // Data Drift Check
        if (nodeA.text !== nodeB.text) {
          isDrifted = true;
          driftReason = "Data Drift";
        } else {
          // Layout Drift Check (tolerance of 3 pixels)
          const dx = Math.abs(nodeA.rect.x - nodeB.rect.x);
          const dy = Math.abs(nodeA.rect.y - nodeB.rect.y);
          const dw = Math.abs(nodeA.rect.width - nodeB.rect.width);
          const dh = Math.abs(nodeA.rect.height - nodeB.rect.height);

          if (dx > 3 || dy > 3 || dw > 3 || dh > 3) {
            isDrifted = true;
            driftReason = "Layout Drift";
          }
        }
      }

      if (isDrifted && !nodeA.path.includes("> footer:")) {
        drifts.push({ path: nodeA.path, reason: driftReason });
        reportList.push({
          component: nodeA.path,
          reason: driftReason,
          productionText: nodeA.text,
          branchText: nodeB
            ? nodeB.text
            : "(Element Missing or Structurally Shifted)",
        });
      }
    }

    const isDiff = drifts.length > 0;

    const safeRouteName =
      route === "/"
        ? "index-page"
        : route.replace(/^\//, "").replace(/\//g, "-");
    const artifactsDir = path.join(
      process.cwd(),
      "test-results",
      "ab-diffs",
      safeRouteName
    );

    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(artifactsDir, "treeA.json"),
      JSON.stringify(treeA, null, 2)
    );
    fs.writeFileSync(
      path.join(artifactsDir, "treeB.json"),
      JSON.stringify(treeB, null, 2)
    );

    if (override.expectDiff ? !isDiff : isDiff) {
      const safeRouteName =
        route === "/"
          ? "index-page"
          : route.replace(/^\//, "").replace(/\//g, "-");
      const artifactsDir = path.join(
        process.cwd(),
        "test-results",
        "ab-diffs",
        safeRouteName
      );
      const cropsDir = path.join(artifactsDir, "focused-crops");

      if (!fs.existsSync(cropsDir)) {
        fs.mkdirSync(cropsDir, { recursive: true });
      }

      // 4. Highlight elements via Native CSS
      let index = 1;
      for (const drift of drifts) {
        const locA = pageA.locator(drift.path).first();
        const locB = pageB.locator(drift.path).first();

        const countA = await locA.count();
        const countB = await locB.count();

        // 1. Take organized individual clean crops (un-highlighted, as requested)
        if (index <= 15) {
          if (countA > 0) {
            await locA.scrollIntoViewIfNeeded().catch(() => {});
            await locA
              .screenshot({
                path: path.join(cropsDir, `drift_${index}_Prod.png`),
                margin: 30,
              } as any)
              .catch(() => {});
          }
          if (countB > 0) {
            await locB.scrollIntoViewIfNeeded().catch(() => {});
            await locB
              .screenshot({
                path: path.join(cropsDir, `drift_${index}_Branch.png`),
                margin: 30,
              } as any)
              .catch(() => {});
          }
        }

        // 2. NOW inject the highlights into the DOM globally via native CSS to bypass brittle Playwright locator locks!
        const highlightCSS =
          drift.reason === "Data Drift"
            ? "4px dashed #FFD700"
            : "4px dashed #FF4500";
        const bgColor =
          drift.reason === "Data Drift"
            ? "rgba(255, 215, 0, 0.2)"
            : "rgba(255, 69, 0, 0.2)";

        if (countA > 0) {
          await pageA
            .evaluate(
              ({ path, css, bg }) => {
                const el = document.querySelector(path) as HTMLElement;
                if (el) {
                  el.style.outline = css;
                  el.style.outlineOffset = "2px";
                  el.style.backgroundColor = bg;
                }
              },
              { path: drift.path, css: highlightCSS, bg: bgColor }
            )
            .catch(() => {});
        }

        if (countB > 0) {
          await pageB
            .evaluate(
              ({ path, css, bg }) => {
                const el = document.querySelector(path) as HTMLElement;
                if (el) {
                  el.style.outline = css;
                  el.style.outlineOffset = "2px";
                  el.style.backgroundColor = bg;
                }
              },
              { path: drift.path, css: highlightCSS, bg: bgColor }
            )
            .catch(() => {});
        }
        index++;
      }

      // 5. Capture screenshots using the natively expanded viewport (no fullPage flag needed)
      await pageA.screenshot({
        path: path.join(artifactsDir, `00_Prod_FullPage_Highlights.png`),
      });
      await pageB.screenshot({
        path: path.join(artifactsDir, `00_Branch_FullPage_Highlights.png`),
      });

      fs.writeFileSync(
        path.join(artifactsDir, `report.json`),
        JSON.stringify(reportList, null, 2)
      );

      console.log(
        `❌ Diff artifacts saved to: ${artifactsDir} for route ${route}`
      );
    }

    if (override.expectDiff) {
      expect(
        isDiff,
        `Expected route ${route} to structurally DIFFER between URLs.`
      ).toBe(true);
    } else {
      expect(
        drifts.length,
        `Expected route ${route} to structurally match URLs. Found ${drifts.length} drifted components.`
      ).toBe(0);
    }
  }

  private async progressiveScroll(page: Page) {
    // Crucial: Wait for initial NextJS hydration and Web3 data fetching on preview deployments
    await page.waitForTimeout(8000);

    let lastHeight = 0;

    // Evaluate maximum scrollable depth across the document including inner overflow containers
    let getScrollHeight = () =>
      Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        ...Array.from(document.querySelectorAll("*")).map((e) => e.scrollHeight)
      );

    let currentHeight = await page.evaluate(getScrollHeight);
    let attempts = 0;

    await page.setViewportSize({ width: 1280, height: 1080 });

    // Position mouse centrally to target inner scrollable containers with hardware scroll
    await page.mouse.move(640, 500);

    while (lastHeight !== currentHeight && attempts < 15) {
      lastHeight = currentHeight;
      await page.mouse.wheel(0, 10000); // Simulate aggressive hardware wheel down
      await page.waitForTimeout(2000);
      currentHeight = await page.evaluate(getScrollHeight);
      attempts++;
    }

    // Expand the viewport cleanly to capture the full page without stitching issues
    await page.setViewportSize({ width: 1280, height: currentHeight + 200 });

    // Snap back to top and physically scroll back up to trigger any sticky/dynamic header intersection observers
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.mouse.wheel(0, -100000);
    await page.waitForTimeout(2000);
  }

  private async extractDOMTree(page: Page) {
    return await page.evaluate(() => {
      // Ultimate Leaf Extractor: Captures images and every single deeply nested piece of text objectively
      const elements = Array.from(document.querySelectorAll("*")).filter(
        (el) => {
          const isVisualBlock =
            el.tagName === "IMG" ||
            el.tagName === "SVG" ||
            el.hasAttribute("data-testid");
          const hasDirectText = Array.from(el.childNodes).some(
            (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim() !== ""
          );
          return isVisualBlock || hasDirectText;
        }
      );

      return elements
        .map((el) => {
          const rect = el.getBoundingClientRect();
          // Discard 0x0
          if (rect.width === 0 || rect.height === 0) return null;

          return {
            tag: el.tagName.toLowerCase(),
            text: (el as HTMLElement).innerText?.trim() || "",
            rect: {
              x: rect.x + window.scrollY,
              y: rect.y + window.scrollY,
              width: rect.width,
              height: rect.height,
            },
            path: getValidCSSPath(el),
          };
        })
        .filter(Boolean);

      function getValidCSSPath(el: Element) {
        const path: string[] = [];
        let curr: Element | null = el;
        while (
          curr &&
          curr.nodeType === Node.ELEMENT_NODE &&
          curr.tagName.toLowerCase() !== "body" &&
          curr.tagName.toLowerCase() !== "html"
        ) {
          let index = 1;
          for (
            let sibling = curr.previousElementSibling;
            sibling;
            sibling = sibling.previousElementSibling
          ) {
            if (sibling.tagName === curr.tagName) index++;
          }
          let selector = curr.tagName.toLowerCase() + `:nth-of-type(${index})`;
          let testid = curr.getAttribute("data-testid");

          if (testid) {
            selector =
              curr.tagName.toLowerCase() +
              `[data-testid="${testid}"]:nth-of-type(${index})`;
            path.unshift(selector);
            break; // Stop climbing! Anchor the path to the data-testid so it survives high-level layout container mutations
          }

          path.unshift(selector);
          curr = curr.parentElement;
        }

        const finalPath = path.join(" > ");
        // Ensure playright can query it from root if it didn't anchor with testid
        if (finalPath.includes("data-testid")) {
          return finalPath;
        }
        return "body > " + finalPath;
      }
    });
  }

  private getOverride(route: string): OverrideConfig {
    if (this.overrides && (this.overrides as any).routes) {
      const routes = (this.overrides as any).routes as Record<
        string,
        OverrideConfig
      >;
      if (routes[route]) {
        return routes[route];
      }
    }
    return (
      (this.overrides && ((this.overrides as any).general as OverrideConfig)) ||
      {}
    );
  }
}
