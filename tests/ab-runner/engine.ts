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

  async diffRoute(
    route: string,
    pageA: Page,
    pageB: Page,
    meta?: { tenant: string; type?: string }
  ) {
    const override = this.getOverride(route);

    const targetA =
      this.urlA.replace(/\/$/, "") +
      (route.startsWith("/") ? route : `/${route}`);
    const targetB =
      this.urlB.replace(/\/$/, "") +
      (route.startsWith("/") ? route : `/${route}`);

    // Execute sequential navigation instead of parallel to prevent Vercel/GraphQL 429 Too Many Requests caching drops on identical simultaneous payloads
    await pageA.goto(targetA, { waitUntil: "commit", timeout: 20000 });
    await pageB.goto(targetB, { waitUntil: "commit", timeout: 20000 });

    // Force wait until React hydrates and renders text content (prevents intermittent blank captures)
    await Promise.all([
      pageA
        .waitForFunction(
          () => document.body && document.body.innerText.trim().length > 50,
          { timeout: 15000 }
        )
        .catch(() => {}),
      pageB
        .waitForFunction(
          () => document.body && document.body.innerText.trim().length > 50,
          { timeout: 15000 }
        )
        .catch(() => {}),
    ]);

    // Force wait until Tailwind skeleton loaders cleanly extinguish natively
    await Promise.all([
      pageA
        .waitForSelector(".animate-pulse, .skeleton", {
          state: "hidden",
          timeout: 25000,
        })
        .catch(() => {}),
      pageB
        .waitForSelector(".animate-pulse, .skeleton", {
          state: "hidden",
          timeout: 25000,
        })
        .catch(() => {}),
    ]);

    // Hide Vercel Live Preview toolbar and exclusively target true Modals/Dialogs/Banners to avoid erasing standard UI headers
    const globalHide = `
      vercel-live-feedback, #vercel-live-button, #vercel-live-feedback, [data-vercel-edit-button], [data-vercel-toolbar],
      .modal, [data-reach-dialog-overlay], [data-headlessui-state="open"] > div[class*="fixed"],
      div[aria-modal="true"], #connectkit-modal, [role="dialog"], dialog, [data-radix-portal], [data-testid="connect-wallet-button"], [id^="connectkit"],
      footer, .footer, [data-testid="footer"]
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

    const drifts: any[] = [];
    const reportList: any[] = [];

    const safeRouteName =
      route === "/"
        ? "index-page"
        : route.replace(/^\//, "").replace(/\//g, "-");
    let artifactsDir = "";
    const hasValidType =
      meta?.type && meta.type !== "undefined" && meta.type !== "null";
    if (meta && meta.tenant) {
      const segments = [
        process.cwd(),
        "test-results",
        "ab-diffs",
        meta.tenant,
        "proposals",
      ];
      if (hasValidType) segments.push(meta.type!);
      segments.push(safeRouteName);
      artifactsDir = path.join(...segments);
    } else {
      artifactsDir = path.join(
        process.cwd(),
        "test-results",
        "ab-diffs",
        safeRouteName
      );
    }
    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir, { recursive: true });
    }

    const compareTrees = (tA: any[], tB: any[]) => {
      const rawDrifts: any[] = [];
      const mapB = new Map<string, any[]>();
      const mapA = new Map<string, any[]>();
      for (const n of tB) {
        if (!mapB.has(n.path)) mapB.set(n.path, []);
        mapB.get(n.path)!.push(n);
      }
      for (const n of tA) {
        if (!mapA.has(n.path)) mapA.set(n.path, []);
        mapA.get(n.path)!.push(n);
      }

      for (const nodeA of tA) {
        if (!nodeA) continue;

        const nodesListB = mapB.get(nodeA.path) || [];
        let nodeB = nodesListB.length > 0 ? nodesListB.shift() : undefined;

        if (!nodeB && nodeA.text && nodeA.text.length > 2) {
          nodeB = tB.find(
            (n: any) => n.text === nodeA.text && n.tag === nodeA.tag
          );
        }

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
            const stylesToCompare = [
              "backgroundColor",
              "color",
              "borderColor",
              "borderWidth",
              "opacity",
              "display",
              "visibility",
            ];
            const hasStyleDrift = stylesToCompare.some(
              (k) => nodeA.style?.[k] !== nodeB.style?.[k]
            );

            if (hasStyleDrift) {
              isDrifted = true;
              driftReason = "Style Drift";
            } else if (!nodeA.isFooter) {
              const dw = Math.abs(nodeA.rect.width - nodeB.rect.width);
              const dh = Math.abs(nodeA.rect.height - nodeB.rect.height);

              if (dw > 10 || dh > 10) {
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

      // 🔴 REVERSE ENGINE TRAVERSAL: Catch Newly Injected UI Components
      for (const nodeB of tB) {
        if (!nodeB || nodeB.isFooter) continue;

        const nodesListA = mapA.get(nodeB.path) || [];
        let nodeA = nodesListA.length > 0 ? nodesListA.shift() : undefined;

        if (!nodeA && nodeB.text && nodeB.text.length > 2) {
          nodeA = tA.find(
            (n: any) => n.text === nodeB.text && n.tag === nodeB.tag
          );
        }

        if (!nodeA) {
          rawDrifts.push({
            path: nodeB.path,
            reason: "Added Component",
            urlA_text: "(Element completely absent in Production Baseline)",
            urlB_text: nodeB.text,
          });
        }
      }

      const mDrifts: any[] = [];
      const mReportList: any[] = [];

      for (const drift of rawDrifts) {
        const hasParentDrift = rawDrifts.some(
          (other: any) =>
            other.path !== drift.path &&
            drift.path.startsWith(other.path + " > ")
        );

        if (
          !hasParentDrift ||
          drift.reason === "Missing or Moved Component" ||
          drift.reason === "Added Component"
        ) {
          mDrifts.push({ path: drift.path, reason: drift.reason });
          mReportList.push({
            component: drift.path,
            reason: drift.reason,
            colorCode:
              drift.reason === "Data Drift"
                ? "Yellow (Data)"
                : drift.reason === "Style Drift"
                  ? "Cyan (Style)"
                  : "Purple (Layout/UI)",
            urlA_text: drift.urlA_text,
            urlB_text: drift.urlB_text,
          });
        }
      }

      const getSeverity = (reason: string) => {
        if (reason === "Added Component") return 3;
        if (reason === "Missing or Moved Component") return 2;
        if (reason === "Data Drift") return 1;
        return 0; // Layout/Style drift usually occurs in mass numbers
      };

      mDrifts.sort((a, b) => getSeverity(b.reason) - getSeverity(a.reason));
      mReportList.sort((a, b) => getSeverity(b.reason) - getSeverity(a.reason));

      return { drifts: mDrifts, reportList: mReportList };
    };

    // 0. Auto-Modal Interception Phase
    const captureAutoModal = async () => {
      // General overlay identifiers across Tailwind, Radix, DialogProvider, and legacy absolute popovers
      const modalSelector =
        'dialog[open], [role="dialog"]:not([aria-hidden="true"]), [aria-modal="true"], [data-state="open"][class*="inset-0"], .fixed.inset-0, .fixed.top-0.right-0.bottom-0.left-0';

      const checkModal = async (p: Page) => {
        try {
          await p.waitForTimeout(1000); // Allow hydration
          const locator = p.locator(modalSelector).first();
          if ((await locator.count()) > 0) {
            return true;
          }
        } catch (e) {}
        return false;
      };

      const [hasModalA, hasModalB] = await Promise.all([
        checkModal(pageA),
        checkModal(pageB),
      ]);

      if (hasModalA || hasModalB) {
        // We have an active auto-modal blocking the view, extract it exclusively!
        const modalTreeA = hasModalA
          ? await this.extractDOMTree(pageA, route, modalSelector)
          : [];
        const modalTreeB = hasModalB
          ? await this.extractDOMTree(pageB, route, modalSelector)
          : [];

        const { drifts: mDrifts, reportList: mReportList } = compareTrees(
          modalTreeA,
          modalTreeB
        );

        if (mDrifts.length > 0) {
          // Add global modal prefixed drifts
          mReportList.forEach((r) => {
            r.component = `[MODAL] ${r.component}`;
            reportList.push(r);
          });
          mDrifts.forEach((d) => drifts.push(d));

          await Promise.all([
            hasModalA
              ? pageA
                  .screenshot({
                    path: path.join(
                      artifactsDir,
                      "00_UrlA_AutoModal_Drift.png"
                    ),
                    timeout: 15000,
                  })
                  .catch(() => {})
              : Promise.resolve(),
            hasModalB
              ? pageB
                  .screenshot({
                    path: path.join(
                      artifactsDir,
                      "00_UrlB_AutoModal_Drift.png"
                    ),
                    timeout: 15000,
                  })
                  .catch(() => {})
              : Promise.resolve(),
          ]);
        }
      }
    };

    await captureAutoModal();

    // Inject a permanent, indestructible CSS barrier against Modals and Overlays
    // This protects both the DOM text extraction and the screenshot pixels from late-hydrating portals.
    const injectModalBarrier = async (p: Page) => {
      await p
        .evaluate(() => {
          const s = document.createElement("style");
          s.innerHTML = `
            dialog, [role="dialog"], [aria-modal="true"], 
            #connectkit-modal, [data-vercel-toolbar], [data-state="open"][class*="inset-0"], .fixed.inset-0, .fixed.top-0.right-0.bottom-0.left-0 {
              display: none !important;
              opacity: 0 !important;
              pointer-events: none !important;
              z-index: -9999 !important;
            }
          `;
          document.head.appendChild(s);
        })
        .catch(() => {});
    };

    await Promise.all([injectModalBarrier(pageA), injectModalBarrier(pageB)]);

    // 1. Scroll to trigger infinite loaders and stabilize the DOM
    await Promise.all([
      this.progressiveScroll(pageA, route),
      this.progressiveScroll(pageB, route),
    ]);

    await Promise.all([
      pageA.keyboard.press("Escape").catch(() => {}),
      pageB.keyboard.press("Escape").catch(() => {}),
    ]);

    // 2. Extract DOM trees
    const treeA = await this.extractDOMTree(pageA, route);
    const treeB = await this.extractDOMTree(pageB, route);

    // 3. Compare trees — only flag deepest-leaf drifts to suppress cascading noise
    // Compare main trees
    const { drifts: mainDrifts, reportList: mainReportList } = compareTrees(
      treeA,
      treeB
    );
    mainDrifts.forEach((d) => drifts.push(d));
    mainReportList.forEach((r) => reportList.push(r));

    const isDiff = drifts.length > 0;

    fs.writeFileSync(
      path.join(artifactsDir, "treeA.json"),
      JSON.stringify(treeA, null, 2)
    );
    fs.writeFileSync(
      path.join(artifactsDir, "treeB.json"),
      JSON.stringify(treeB, null, 2)
    );

    const captureTooltipLayer = async () => {
      if (!meta?.type) return;

      // Native radix UI components, custom metrics threshold buttons, and fallback data-testids
      const triggerSelector =
        '[data-testid="results-tooltip-trigger"], button[aria-label*="threshold"], svg.lucide-alert-triangle, svg.lucide-info, [data-state="closed"]';
      const tooltipSelector = '[role="tooltip"]';

      const captureForPage = async (page: Page, label: string) => {
        try {
          const trigger = page.locator(triggerSelector).first();
          if ((await trigger.count()) > 0) {
            await trigger.scrollIntoViewIfNeeded().catch(() => {});
            await trigger.hover().catch(() => {});
            await page.waitForTimeout(500);

            await page
              .screenshot({
                path: path.join(
                  artifactsDir,
                  `00_${label}_FullPage_Tooltip.png`
                ),
                timeout: 15000,
              })
              .catch(() => {});

            const tooltipsDir = path.join(
              artifactsDir,
              "focused-crops",
              "tooltips"
            );
            if (!fs.existsSync(tooltipsDir)) {
              fs.mkdirSync(tooltipsDir, { recursive: true });
            }

            const popover = page.locator(tooltipSelector).first();
            if ((await popover.count()) > 0) {
              await popover
                .screenshot({
                  path: path.join(tooltipsDir, `00_${label}_Crop.png`),
                  timeout: 15000,
                })
                .catch(() => {});
            }

            // Defuse tooltip to keep viewport clean
            await page.keyboard.press("Escape").catch(() => {});
          }
        } catch (e) {}
      };

      await Promise.all([
        captureForPage(pageA, "UrlA"),
        captureForPage(pageB, "UrlB"),
      ]);
    };

    if (override.expectDiff ? !isDiff : isDiff) {
      const cropsDir = path.join(artifactsDir, "focused-crops");

      if (!fs.existsSync(cropsDir)) {
        fs.mkdirSync(cropsDir, { recursive: true });
      }

      // 4. Batch-inject highlights in a single evaluate() per page
      const highlightPayload = drifts.map((d) => ({
        path: d.path,
        css:
          d.reason === "Data Drift"
            ? "4px dashed #FFD700" // Yellow
            : d.reason === "Style Drift"
              ? "4px dashed #00FFFF" // Cyan
              : d.reason === "Added Component"
                ? "4px dashed #FF00FF" // Hot Pink
                : "4px dashed #8A2BE2", // Purple
        bg:
          d.reason === "Data Drift"
            ? "rgba(255, 215, 0, 0.2)"
            : d.reason === "Style Drift"
              ? "rgba(0, 255, 255, 0.2)"
              : d.reason === "Added Component"
                ? "rgba(255, 0, 255, 0.4)" // Hot Pink
                : "rgba(138, 43, 226, 0.2)",
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

      // Inject Source URL Overlay requested by Jeff
      const injectOverlay = async (p: Page, label: string, u: string) => {
        await p
          .evaluate(
            ({ l, base }) => {
              const el = document.createElement("div");
              el.innerHTML = `<strong>${l}</strong> <br/> <small style="opacity: 0.8">${base}</small>`;
              el.style.cssText =
                "position: fixed; bottom: 20px; left: 20px; z-index: 2147483647; background: rgba(0,0,0,0.8); color: #fff; padding: 12px 16px; font-family: monospace; font-size: 14px; border-radius: 8px; border: 1px solid #444; box-shadow: 0 4px 12px rgba(0,0,0,0.5); pointer-events: none;";
              document.body.appendChild(el);
            },
            { l: label, base: u }
          )
          .catch(() => {});
      };

      await Promise.all([
        injectOverlay(pageA, "A (Production)", this.urlA),
        injectOverlay(pageB, "B (Branch/CPLS)", this.urlB),
      ]);

      // 5. Full-page screenshots before crops — captured after load state settles
      await Promise.all([
        pageA.waitForLoadState("load", { timeout: 15000 }).catch(() => {}),
        pageB.waitForLoadState("load", { timeout: 15000 }).catch(() => {}),
      ]);
      await pageA
        .screenshot({
          path: path.join(artifactsDir, `00_UrlA_FullPage_Highlights.png`),
          timeout: 15000,
        })
        .catch(() => {});
      await pageB
        .screenshot({
          path: path.join(artifactsDir, `00_UrlB_FullPage_Highlights.png`),
          timeout: 15000,
        })
        .catch(() => {});

      await captureTooltipLayer();

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
                    timeout: 15000,
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
                    timeout: 15000,
                  })
                  .catch(() => {});
              }
            } catch {}
          })(),
        ]);
      }
    } else {
      // Inject Source URL Overlay requested by Jeff
      const injectOverlay = async (p: Page, label: string, u: string) => {
        await p
          .evaluate(
            ({ l, base }) => {
              const el = document.createElement("div");
              el.innerHTML = `<strong>${l}</strong> <br/> <small style="opacity: 0.8">${base}</small>`;
              el.style.cssText =
                "position: fixed; bottom: 20px; left: 20px; z-index: 2147483647; background: rgba(0,0,0,0.8); color: #fff; padding: 12px 16px; font-family: monospace; font-size: 14px; border-radius: 8px; border: 1px solid #444; box-shadow: 0 4px 12px rgba(0,0,0,0.5); pointer-events: none;";
              document.body.appendChild(el);
            },
            { l: label, base: u }
          )
          .catch(() => {});
      };

      await Promise.all([
        injectOverlay(pageA, "A (Production)", this.urlA),
        injectOverlay(pageB, "B (Branch/CPLS)", this.urlB),
      ]);

      // No drifts — capture full-page baselines
      await Promise.all([
        pageA.waitForLoadState("load", { timeout: 15000 }).catch(() => {}),
        pageB.waitForLoadState("load", { timeout: 15000 }).catch(() => {}),
      ]);
      await pageA
        .screenshot({
          path: path.join(artifactsDir, `00_UrlA_FullPage_Highlights.png`),
          timeout: 15000,
        })
        .catch(() => {});
      await pageB
        .screenshot({
          path: path.join(artifactsDir, `00_UrlB_FullPage_Highlights.png`),
          timeout: 15000,
        })
        .catch(() => {});
      await captureTooltipLayer();
    }

    const reportWithMeta = [
      {
        reportDescription: {
          urlA: this.urlA,
          urlB: this.urlB,
          route,
          driftsFound: drifts.length,
          status:
            drifts.length === 0
              ? "PASSED - NO DRIFTS DETECTED"
              : "FAILED - DRIFTS DETECTED",
          generatedAt: new Date().toISOString(),
          colorLegend: {
            "Data Drift": "Yellow (#FFD700)",
            "Style Drift": "Cyan (#00FFFF)",
            "Layout/UI Drift": "Purple (#8A2BE2)",
          },
        },
      },
      ...reportList,
    ];
    fs.writeFileSync(
      path.join(artifactsDir, `report.json`),
      JSON.stringify(reportWithMeta, null, 2)
    );

    if (drifts.length > 0) {
      console.log(
        `❌ Diff artifacts saved to: ${artifactsDir} for route ${route}`
      );
    } else {
      console.log(
        `✅ 0 Drifts. Baseline full-page screenshots and empty report.json saved to: ${artifactsDir} for route ${route}`
      );
    }

    const numStyle = reportList.filter(
      (r) => r.reason === "Style Drift"
    ).length;
    const numLayout = reportList.filter(
      (r) => r.reason === "Layout Drift"
    ).length;
    const numData = reportList.filter((r) => r.reason === "Data Drift").length;
    const numMissing = reportList.filter(
      (r) => r.reason === "Missing or Moved Component"
    ).length;

    const topDrifts = reportList
      .slice(0, 3)
      .map((r) => `   - ${r.component}`)
      .join("\n");

    const runId = process.env.GITHUB_RUN_ID;
    const bucketLink = runId
      ? `🔗 View Full Report & Images: https://console.cloud.google.com/storage/browser/agora-ab-artifacts/reports/${new Date().toISOString().split("T")[0]}/${process.env.GITHUB_ACTOR || "cli"}_run-${runId}?project=silent-turbine-390703`
      : `🔗 View Full Report locally at: ${artifactsDir}/report.json`;

    if (override.expectDiff) {
      expect(
        isDiff,
        `\n\n🛑 EXPECTED VISUAL DRIFT MISSING 🛑\n\nExpected route "${route}" to structurally DIFFER between URLs, but they were visually identical.\n`
      ).toBe(true);
    } else {
      expect(
        drifts.length,
        `\n\n🛑 VISUAL DRIFT THRESHOLD EXCEEDED 🛑\n\n` +
          `The A/B regression engine detected ${drifts.length} block-level drift(s) on route: "${route}".\n\n` +
          `📊 DRIFT ANATOMY BREAKDOWN:\n` +
          `   🎨 Style Differences: ${numStyle}\n` +
          `   📏 Layout/Size Shifts: ${numLayout}\n` +
          `   ✍️ Data/Text Changes: ${numData}\n` +
          `   👻 Missing Components: ${numMissing}\n\n` +
          `🔍 TOP AFFECTED SELECTORS (Sneak Peek):\n${topDrifts || "   (None)"}\n\n` +
          `${bucketLink}\n\n` +
          `Context: This means some React elements changed color, spacing, or text compared to Production.\n` +
          `Don't panic! This is NOT a code crash. Please verify if these visual variations are intentional redesigns or true bugs.\n`
      ).toBe(0);
    }
  }

  private async progressiveScroll(page: Page, route: string) {
    // Wait for initial Next.js hydration and Web3 data fetching
    await page.waitForTimeout(5000);

    const isDelegatesRoute = route === "/delegates";
    const maxAttempts = isDelegatesRoute ? 2 : 12;
    const maxViewportHeight = isDelegatesRoute ? 3000 : 35000;

    let lastHeight = 0;
    let lastCount = 0;
    let stableRounds = 0;

    const getScrollHeight = () =>
      Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
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
      await page.evaluate(() =>
        window.scrollTo(
          0,
          Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
          )
        )
      );
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

  private async extractDOMTree(
    page: Page,
    route: string,
    customScope?: string
  ) {
    return await page.evaluate(
      ({ rt, cs }) => {
        let scope = cs || "*";
        if (!cs) {
          if (rt.includes("/delegates")) scope = "a[href*='/delegates/'] *";
          if (rt === "/proposals") scope = "a[href*='/proposals/'] *";
        }

        const MAX_ELEMENTS = 10000;
        const allElements = document.querySelectorAll(scope);
        const elements = Array.from(allElements)
          .filter((el) => {
            if (
              el.closest("vercel-live-feedback") ||
              el.closest("[data-vercel-toolbar]") ||
              el.closest("footer") ||
              el.closest(".bg-footerBackground")
            )
              return false;

            const text = el.textContent?.trim();
            if (text === "Loading" || text === "Loading...") return false;

            const isVisualBlock = el.tagName === "IMG" || el.tagName === "SVG";
            const hasDirectText = Array.from(el.childNodes).some(
              (n) =>
                n.nodeType === Node.TEXT_NODE && n.textContent?.trim() !== ""
            );
            return isVisualBlock || hasDirectText;
          })
          .slice(0, MAX_ELEMENTS);

        return elements
          .map((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return null;
            const cs = window.getComputedStyle(el);

            return {
              tag: el.tagName.toLowerCase(),
              text: ((el as HTMLElement).innerText || "")
                .replace(/\s+/g, " ")
                .trim(),
              rect: {
                x: rect.x + window.scrollY,
                y: rect.y + window.scrollY,
                width: rect.width,
                height: rect.height,
              },
              style: {
                backgroundColor: cs.backgroundColor,
                color: cs.color,
                borderColor: cs.borderColor,
                borderWidth: cs.borderWidth,
                opacity: cs.opacity,
                display: cs.display,
                visibility: cs.visibility,
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
            let selector =
              curr.tagName.toLowerCase() + `:nth-of-type(${index})`;
            const testid = curr.getAttribute("data-testid");
            const href = curr.getAttribute("href");

            if (testid) {
              selector =
                curr.tagName.toLowerCase() +
                `[data-testid="${testid}"]:nth-of-type(${index})`;
              path.unshift(selector);
              break; // Anchor to data-testid — stable across layout refactors
            }

            if (href && href.length > 2 && curr.tagName.toLowerCase() === "a") {
              selector = curr.tagName.toLowerCase() + `[href="${href}"]`;
              path.unshift(selector);
              break; // Anchor to href for dynamic cards without data-testid
            }

            path.unshift(selector);
            curr = curr.parentElement;
          }

          const finalPath = path.join(" > ");
          if (
            finalPath.includes("data-testid") ||
            finalPath.includes("href=")
          ) {
            return finalPath;
          }
          return "body > " + finalPath;
        }
      },
      { rt: route, cs: customScope }
    );
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
