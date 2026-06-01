/**
 * Local HTTP server that serves mock CPLS archive fixtures.
 *
 * Intercepts the same URL patterns as the real GCS bucket so that
 * the Next.js dev server can fetch mock data instead of hitting GCS.
 *
 * URL patterns served:
 *   /data/:namespace/proposal_list/dao_node/raw.ndjson.gz
 *   /data/:namespace/proposal_list/eas-atlas/raw.ndjson.gz
 *   /data/:namespace/proposal/dao_node/raw/:id.json.gz
 *   /data/:namespace/proposal/eas-atlas/raw/:id.json.gz
 */

import http from "http";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { gzipSync } from "zlib";

export const MOCK_ARCHIVE_SERVER_PORT = 9191;

const MOCK_ROOT = join(__dirname, "../__mocks__");

function buildNdjsonGz(source: "dao_node" | "eas-atlas"): Buffer {
  const dir = join(MOCK_ROOT, source);
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort();

  const lines = files.map((f) => {
    const raw = readFileSync(join(dir, f), "utf-8");
    return JSON.stringify(JSON.parse(raw));
  });

  return gzipSync(Buffer.from(lines.join("\n") + "\n", "utf-8"));
}

export function startMockArchiveServer(): http.Server {
  const server = http.createServer((req, res) => {
    // Strip query params (cache-bust ?t=...)
    const urlPath = (req.url ?? "").split("?")[0];

    res.setHeader("Content-Type", "application/octet-stream");

    // List endpoints
    const listMatch = urlPath.match(
      /\/proposal_list\/(dao_node|eas-atlas)\/raw\.ndjson\.gz$/
    );
    if (listMatch) {
      const source = listMatch[1] as "dao_node" | "eas-atlas";
      try {
        const data = buildNdjsonGz(source);
        res.writeHead(200);
        res.end(data);
      } catch (err) {
        res.writeHead(500);
        res.end(String(err));
      }
      return;
    }

    // Individual proposal endpoints
    const proposalMatch = urlPath.match(
      /\/proposal\/(dao_node|eas-atlas)\/raw\/(.+)\.json\.gz$/
    );
    if (proposalMatch) {
      const source = proposalMatch[1] as "dao_node" | "eas-atlas";
      const id = proposalMatch[2];
      const filePath = join(MOCK_ROOT, source, `${id}.json`);
      try {
        const data = gzipSync(readFileSync(filePath));
        res.writeHead(200);
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end("Not found");
      }
      return;
    }

    res.writeHead(404);
    res.end("Not found");
  });

  server.listen(MOCK_ARCHIVE_SERVER_PORT);
  return server;
}
