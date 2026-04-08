import { test, expect, Page } from "@playwright/test";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
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
    this.urlB = process.env.URL_B || "http://127.0.0.1:3000"; // Fallback to same if not defined, ideally a PR preview vs prod

    const overridesPath = path.join(__dirname, "overrides.json");
    this.overrides = JSON.parse(fs.readFileSync(overridesPath, "utf-8"));
  }

  /**
   * Evaluates the given route across URL_A and URL_B in parallel.
   */
  async diffRoute(route: string, pageA: Page, pageB: Page) {
    const override = this.getOverride(route);
    
    // Construct full URLs
    const targetA = this.urlA.replace(/\/$/, "") + (route.startsWith("/") ? route : `/${route}`);
    const targetB = this.urlB.replace(/\/$/, "") + (route.startsWith("/") ? route : `/${route}`);

    // Navigate to A and B
    await Promise.all([
      pageA.goto(targetA, { waitUntil: "domcontentloaded" }),
      pageB.goto(targetB, { waitUntil: "domcontentloaded" })
    ]);

    // Apply specific CSS masks if needed to hide volatile components
    if (override.ignoreSelectors && override.ignoreSelectors.length > 0) {
      const maskStyles = override.ignoreSelectors.join(", ") + " { opacity: 0 !important; visibility: hidden !important; }";
      
      await Promise.all([
        pageA.addStyleTag({ content: maskStyles }),
        pageB.addStyleTag({ content: maskStyles })
      ]);
    }

    // Capture Full Page screenshots
    const bufferA = await pageA.screenshot({ fullPage: true, animations: "disabled" });
    const bufferB = await pageB.screenshot({ fullPage: true, animations: "disabled" });

    // Parse images to pixel buffers
    const imgA = PNG.sync.read(bufferA);
    const imgB = PNG.sync.read(bufferB);

    // Synchronize image dimensions (use max of both)
    const width = Math.max(imgA.width, imgB.width);
    const height = Math.max(imgA.height, imgB.height);

    const diffImg = new PNG({ width, height });

    // Resize or padding buffers to match if pages are different lengths
    const paddedImgA = this.padImage(imgA, width, height);
    const paddedImgB = this.padImage(imgB, width, height);

    // Compute pixel difference
    let diffPixels = 0;
    try {
      diffPixels = pixelmatch(paddedImgA.data, paddedImgB.data, diffImg.data, width, height, { threshold: 0.1 });
    } catch (e: any) {
      // Dimensions mismatched catastrophically or pixelmatch failed
      diffPixels = 999999;
      console.warn("Pixelmatch crashed. Likely catastrophic layout length difference.");
    }

    const isDiff = diffPixels > 0;
    
    // Save diff artifact if we failed the expectation
    if (override.expectDiff ? !isDiff : isDiff) {
      const artifactsDir = path.join(process.cwd(), "test-results", "ab-diffs");
      if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
      }

      const safeRoute = route.replace(/\//g, "_").replace(/^_/, "");
      fs.writeFileSync(path.join(artifactsDir, `${safeRoute}_A.png`), PNG.sync.write(paddedImgA));
      fs.writeFileSync(path.join(artifactsDir, `${safeRoute}_B.png`), PNG.sync.write(paddedImgB));
      fs.writeFileSync(path.join(artifactsDir, `${safeRoute}_diff.png`), PNG.sync.write(diffImg));
      
      console.log(`❌ Diff artifacts saved to: ${artifactsDir} for route ${route}`);
    }

    if (override.expectDiff) {
      expect(isDiff, `Expected route ${route} to structurally DIFFER between URLs, but they were identical. Whitelist expects a diff. Reason: ${override.reason || "None"}`).toBe(true);
    } else {
      expect(diffPixels, `Expected route ${route} to structurally match between URLs. Found ${diffPixels} visual pixel diffs.`).toBe(0);
    }
  }

  private getOverride(route: string): OverrideConfig {
    const routes = this.overrides.routes as Record<string, OverrideConfig>;
    if (routes[route]) {
      return routes[route];
    }
    return this.overrides.general as OverrideConfig || {};
  }

  private padImage(img: PNG, targetWidth: number, targetHeight: number): PNG {
    if (img.width === targetWidth && img.height === targetHeight) {
      return img;
    }
    
    const padded = new PNG({ width: targetWidth, height: targetHeight });
    // Fill background with white to avoid transparent pixelmatch mismatches
    padded.data.fill(255);
    
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const destIdx = (targetWidth * y + x) << 2;
        const srcIdx = (img.width * y + x) << 2;
        
        padded.data[destIdx] = img.data[srcIdx];
        padded.data[destIdx + 1] = img.data[srcIdx + 1];
        padded.data[destIdx + 2] = img.data[srcIdx + 2];
        padded.data[destIdx + 3] = img.data[srcIdx + 3];
      }
    }
    return padded;
  }
}
