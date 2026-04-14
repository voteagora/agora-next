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

    // 1. Progressively scroll down to lazy load all components
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
      const nodeB = mapB.get(nodeA.path);
      if (!nodeB) continue;

      let isDrifted = false;
      let driftReason = "";

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

      if (isDrifted) {
        drifts.push({ path: nodeA.path, reason: driftReason });
        reportList.push({
          component: nodeA.path,
          reason: driftReason,
          productionText: nodeA.text,
          branchText: nodeB.text,
        });
      }
    }

    const isDiff = drifts.length > 0;

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

        if ((await locA.count()) > 0 && (await locB.count()) > 0) {
          await locA.scrollIntoViewIfNeeded();
          await locB.scrollIntoViewIfNeeded();

          // 1. Take organized individual clean crops (un-highlighted, as requested)
          if (index <= 15) {
            await locA
              .screenshot({
                path: path.join(cropsDir, `drift_${index}_Prod.png`),
                margin: 30,
              } as any)
              .catch(() => {});
            await locB
              .screenshot({
                path: path.join(cropsDir, `drift_${index}_Branch.png`),
                margin: 30,
              } as any)
              .catch(() => {});
          }

          // 2. NOW inject the highlights into the DOM so they only appear on the Full Page map!
          const highlightCSS =
            drift.reason === "Data Drift"
              ? "4px dashed #FFD700"
              : "4px dashed #FF4500";
          const bgColor =
            drift.reason === "Data Drift"
              ? "rgba(255, 215, 0, 0.2)"
              : "rgba(255, 69, 0, 0.2)";

          await locA.evaluate(
            (el: HTMLElement, args) => {
              el.style.outline = args.css;
              el.style.outlineOffset = "2px";
              el.style.backgroundColor = args.bg;
            },
            { css: highlightCSS, bg: bgColor }
          );

          await locB.evaluate(
            (el: HTMLElement, args) => {
              el.style.outline = args.css;
              el.style.outlineOffset = "2px";
              el.style.backgroundColor = args.bg;
            },
            { css: highlightCSS, bg: bgColor }
          );
        }
        index++;
      }

      // 5. Expand viewport manually to match scroll height before screenshot
      // This forces React to repaint virtualized/lazy-loaded rows that would otherwise appear as blank white spaces in Playwright's native fullPage screenshot.
      const heightA = await pageA.evaluate(() =>
        Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        )
      );
      const heightB = await pageB.evaluate(() =>
        Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        )
      );

      await pageA.setViewportSize({ width: 1280, height: heightA });
      await pageB.setViewportSize({ width: 1280, height: heightB });

      // Give React/Tailwind complete time to hydrate the newly massive viewport
      await pageA.waitForTimeout(3000);

      // Capture screenshots using the natively expanded viewport (no fullPage flag needed)
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
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 300;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight || totalHeight > 10000) {
            clearInterval(timer);
            resolve();
          }
        }, 80);
      });
    });

    // Snap back to top
    await page.evaluate(() => window.scrollTo(0, 0));

    // Explicitly grant Next.js/React hydration time to remount top-level banner components that were virtualized/unmounted
    // We use a safe static delay instead of relying on img.complete, as Next.js lazy-loading suppresses onload events for off-screen images.
    await page.waitForTimeout(4000);
  }

  private async extractDOMTree(page: Page) {
    return await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll(
          "h1, h2, h3, h4, p, span, a, button, img, [data-testid], td, th"
        )
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

      function getValidCSSPath(el: Element): string {
        const path = [];
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
          if (testid)
            selector =
              curr.tagName.toLowerCase() +
              `[data-testid="${testid}"]:nth-of-type(${index})`;

          path.unshift(selector);
          curr = curr.parentElement;
        }
        return "body > " + path.join(" > ");
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
