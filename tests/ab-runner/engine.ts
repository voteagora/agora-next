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

    await Promise.all([pageA.waitForTimeout(1500), pageB.waitForTimeout(1500)]);

    // Hide Vercel Live Preview toolbar and any overlay Modals/Dialogs/Banners to prevent layout shifts and blocked screenshots
    const globalHide = `
      vercel-live-feedback, #vercel-live-button, #vercel-live-feedback,
      [role="dialog"], dialog, .modal, [data-reach-dialog-overlay], [data-headlessui-state="open"] > div[class*="fixed"],
      div[aria-modal="true"], #connectkit-modal, body > div[class*="fixed"][class*="z-50"]
      { display: none !important; opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; }
      body { overflow: auto !important; padding-right: 0 !important; }
    `;
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

    // 1. Scroll to trigger infinite loaders and stabilize the DOM
    await Promise.all([
      this.progressiveScroll(pageA, route),
      this.progressiveScroll(pageB, route),
    ]);

    // Aggressively dismiss accessible modals via Escape and hide standard portals
    await Promise.all([
      pageA.keyboard.press("Escape").catch(() => {}),
      pageB.keyboard.press("Escape").catch(() => {}),
      pageA
        .evaluate(() => {
          document
            .querySelectorAll(
              '[data-radix-portal], [aria-modal="true"], [role="dialog"], [data-state="open"], .fixed.inset-0, [class*="z-[100]"], [class*="z-50"]'
            )
            .forEach((el) => ((el as any).style.display = "none"));
        })
        .catch(() => {}),
      pageB
        .evaluate(() => {
          document
            .querySelectorAll(
              '[data-radix-portal], [aria-modal="true"], [role="dialog"], [data-state="open"], .fixed.inset-0, [class*="z-[100]"], [class*="z-50"]'
            )
            .forEach((el) => ((el as any).style.display = "none"));
        })
        .catch(() => {}),
    ]);

    // 2. Extract DOM trees
    const treeA = await this.extractDOMTree(pageA, route);
    const treeB = await this.extractDOMTree(pageB, route);

    // 3. Compare trees — only flag deepest-leaf drifts to suppress cascading noise
    const rawDrifts: any[] = [];

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
        if (nodeA.text !== nodeB.text) {
          isDrifted = true;
          driftReason = "Data Drift";
        } else {
          // Only check width/height — x/y coordinates cascade from parent shifts
          // We explicitely skip Layout check for Footer items since footer y-shifts on content height
          if (!nodeA.isFooter) {
            const dw = Math.abs(nodeA.rect.width - nodeB.rect.width);
            const dh = Math.abs(nodeA.rect.height - nodeB.rect.height);

            if (dw > 3 || dh > 3) {
              isDrifted = true;
              driftReason = "Layout Drift";
            }
          }
        }
      }

      if (isDrifted) {
        rawDrifts.push({
          path: nodeA.path,
          reason: driftReason,
          urlA_text: nodeA.text,
          urlB_text: nodeB
            ? nodeB.text
            : "(Element Missing or Structurally Shifted)",
        });
      }
    }

    // De-duplicate: suppress parent if a child drift already covers the same change
    const drifts: any[] = [];
    const reportList: any[] = [];

    for (const drift of rawDrifts) {
      const hasChildDrift = rawDrifts.some(
        (other: any) =>
          other.path !== drift.path && other.path.startsWith(drift.path + " > ")
      );
      if (!hasChildDrift || drift.reason === "Missing or Moved Component") {
        drifts.push({ path: drift.path, reason: drift.reason });
        reportList.push({
          component: drift.path,
          reason: drift.reason,
          urlA_text: drift.urlA_text,
          urlB_text: drift.urlB_text,
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
      const cropsDir = path.join(artifactsDir, "focused-crops");

      if (!fs.existsSync(cropsDir)) {
        fs.mkdirSync(cropsDir, { recursive: true });
      }

      // 4. Batch-inject highlights in a single evaluate() per page
      const highlightPayload = drifts.slice(0, 50).map((d) => ({
        path: d.path,
        css:
          d.reason === "Data Drift"
            ? "4px dashed #FFD700"
            : "4px dashed #FF4500",
        bg:
          d.reason === "Data Drift"
            ? "rgba(255, 215, 0, 0.2)"
            : "rgba(255, 69, 0, 0.2)",
      }));

      const batchHighlight = (items: typeof highlightPayload) => {
        for (const item of items) {
          try {
            const el = document.querySelector(item.path) as HTMLElement;
            if (el) {
              el.style.outline = item.css;
              el.style.outlineOffset = "2px";
              el.style.backgroundColor = item.bg;
            }
          } catch {}
        }
      };

      await Promise.all([
        pageA.evaluate(batchHighlight, highlightPayload).catch(() => {}),
        pageB.evaluate(batchHighlight, highlightPayload).catch(() => {}),
      ]);

      // 5. Full-page screenshots before crops — captured after load state settles
      await Promise.all([
        pageA.waitForLoadState("load", { timeout: 10000 }).catch(() => {}),
        pageB.waitForLoadState("load", { timeout: 10000 }).catch(() => {}),
      ]);
      await pageA.screenshot({
        path: path.join(artifactsDir, `00_UrlA_FullPage_Highlights.png`),
      });
      await pageB.screenshot({
        path: path.join(artifactsDir, `00_UrlB_FullPage_Highlights.png`),
      });

      // 6. Focused crops — UrlA and UrlB captured in parallel per drift
      const cropDrifts = drifts.slice(0, 10);
      for (let i = 0; i < cropDrifts.length; i++) {
        const drift = cropDrifts[i];
        await Promise.all([
          (async () => {
            try {
              const locA = pageA.locator(drift.path).first();
              if ((await locA.count()) > 0) {
                await locA.scrollIntoViewIfNeeded().catch(() => {});
                await locA
                  .screenshot({
                    path: path.join(cropsDir, `drift_${i + 1}_UrlA.png`),
                  })
                  .catch(() => {});
              }
            } catch {}
          })(),
          (async () => {
            try {
              const locB = pageB.locator(drift.path).first();
              if ((await locB.count()) > 0) {
                await locB.scrollIntoViewIfNeeded().catch(() => {});
                await locB
                  .screenshot({
                    path: path.join(cropsDir, `drift_${i + 1}_UrlB.png`),
                  })
                  .catch(() => {});
              }
            } catch {}
          })(),
        ]);
      }
    } else {
      // No drifts — capture full-page baselines
      await Promise.all([
        pageA.waitForLoadState("load", { timeout: 10000 }).catch(() => {}),
        pageB.waitForLoadState("load", { timeout: 10000 }).catch(() => {}),
      ]);
      await pageA.screenshot({
        path: path.join(artifactsDir, `00_UrlA_FullPage_Highlights.png`),
      });
      await pageB.screenshot({
        path: path.join(artifactsDir, `00_UrlB_FullPage_Highlights.png`),
      });
    }

    if (drifts.length > 0) {
      const reportWithMeta = [
        {
          reportDescription: {
            urlA: this.urlA,
            urlB: this.urlB,
            route,
            driftsFound: drifts.length,
            generatedAt: new Date().toISOString(),
          },
        },
        ...reportList,
      ];
      fs.writeFileSync(
        path.join(artifactsDir, `report.json`),
        JSON.stringify(reportWithMeta, null, 2)
      );

      console.log(
        `❌ Diff artifacts saved to: ${artifactsDir} for route ${route}`
      );
    } else {
      console.log(
        `✅ 0 Drifts. Baseline full-page screenshots saved to: ${artifactsDir} for route ${route}`
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

  private async progressiveScroll(page: Page, route: string) {
    // Wait for initial Next.js hydration and Web3 data fetching
    await page.waitForTimeout(5000);

    const isDelegatesRoute = route === "/delegates";
    const maxAttempts = isDelegatesRoute ? 5 : 12;
    const maxViewportHeight = isDelegatesRoute ? 8000 : 15000;

    let lastHeight = 0;
    let lastCount = 0;
    let stableRounds = 0;

    const getScrollHeight = () => document.body.scrollHeight;
    const getListCount = () =>
      document.querySelectorAll(
        "a[href*='/proposals/'], a[href*='/delegates/'], a[href*='/voters/']"
      ).length;

    let currentHeight = await page.evaluate(getScrollHeight);
    let currentCount = await page.evaluate(getListCount);
    let attempts = 0;

    await page.setViewportSize({ width: 1280, height: 1080 });
    await page.mouse.move(640, 500);

    while (attempts < maxAttempts) {
      await page.mouse.wheel(0, 15000);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);

      currentHeight = await page.evaluate(getScrollHeight);
      currentCount = await page.evaluate(getListCount);

      const heightStable = lastHeight === currentHeight;
      const countStable = lastCount === currentCount;
      const isLoading = await page.evaluate(() =>
        document.body.innerText.includes("Loading")
      );

      if (heightStable && countStable && !isLoading) {
        stableRounds++;
        if (stableRounds >= 2) {
          break;
        }
      } else {
        stableRounds = 0;
      }

      lastHeight = currentHeight;
      lastCount = currentCount;
      attempts++;
    }

    // Expand viewport to fit all loaded content
    const artificialHeight = Math.min(
      maxViewportHeight,
      Math.max(1080, currentHeight + 200)
    );
    await page.setViewportSize({ width: 1280, height: artificialHeight });

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.mouse.wheel(0, -100000);

    await page.waitForTimeout(3000);
  }

  private async extractDOMTree(page: Page, route: string) {
    return await page.evaluate((rt) => {
      // Scope to delegate cards on /delegates to avoid O(N²) CSS path traversal
      const scope = rt === "/delegates" ? "a[href*='/delegates/'] *" : "*";

      const MAX_ELEMENTS = 2000;
      const allElements = document.querySelectorAll(scope);
      const elements = Array.from(allElements)
        .filter((el) => {
          const isVisualBlock =
            el.tagName === "IMG" ||
            el.tagName === "SVG" ||
            el.hasAttribute("data-testid");
          const hasDirectText = Array.from(el.childNodes).some(
            (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim() !== ""
          );
          return isVisualBlock || hasDirectText;
        })
        .slice(0, MAX_ELEMENTS);

      return elements
        .map((el) => {
          const rect = el.getBoundingClientRect();
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
            isFooter: !!el.closest("footer"),
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
          const testid = curr.getAttribute("data-testid");
          const href = curr.getAttribute("href");

          if (testid) {
            selector =
              curr.tagName.toLowerCase() +
              `[data-testid="${testid}"]:nth-of-type(${index})`;
            path.unshift(selector);
            break; // Anchor to data-testid — stable across layout refactors
          }

          if (href && href.length > 2) {
            selector = curr.tagName.toLowerCase() + `[href="${href}"]`;
            path.unshift(selector);
            break; // Anchor to href for dynamic cards without data-testid
          }

          path.unshift(selector);
          curr = curr.parentElement;
        }

        const finalPath = path.join(" > ");
        if (finalPath.includes("data-testid") || finalPath.includes("href=")) {
          return finalPath;
        }
        return "body > " + finalPath;
      }
    }, route);
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
