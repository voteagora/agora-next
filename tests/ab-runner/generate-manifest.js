#!/usr/bin/env node
/**
 * Generates a manifest.json inside test-results/ab-diffs/ that lists every
 * report.json found in the directory tree, along with the sibling image files.
 *
 * This manifest is consumed by the telemetry_dashboard.html Local mode to
 * discover all scopes (including deeply nested archive proposals).
 *
 * Usage:  node tests/ab-runner/generate-manifest.js
 * Called automatically by `npm run test:ab`.
 */

const fs = require("fs");
const path = require("path");

const BASE_DIR = path.resolve(__dirname, "../../test-results/ab-diffs");

if (!fs.existsSync(BASE_DIR)) {
  console.log("⚠ No ab-diffs directory found — skipping manifest generation.");
  process.exit(0);
}

const reports = [];

function walk(dir, rel) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = rel ? `${rel}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      walk(fullPath, relPath);
    } else if (entry.name === "report.json") {
      const parentDir = path.dirname(fullPath);
      const images = [];

      // Collect sibling images
      try {
        for (const f of fs.readdirSync(parentDir)) {
          if (f.endsWith(".png")) images.push(f);
        }
      } catch {}

      // Collect focused-crops/ images
      const cropsDir = path.join(parentDir, "focused-crops");
      try {
        if (fs.existsSync(cropsDir)) {
          for (const f of fs.readdirSync(cropsDir)) {
            if (f.endsWith(".png")) images.push(`focused-crops/${f}`);
          }
        }
      } catch {}

      reports.push({ path: relPath, images });
    }
  }
}

walk(BASE_DIR, "");

const manifest = { reports, generated: new Date().toISOString() };
const outPath = path.join(BASE_DIR, "manifest.json");
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));

console.log(`✅ manifest.json → ${reports.length} reports indexed`);
