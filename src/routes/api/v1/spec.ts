/*
 * TanStack Start port of src/app/api/v1/spec/route.ts.
 * Public — skips bearer-token validation.
 *
 * URL: GET /api/v1/spec
 */

import fs from "node:fs";
import path from "node:path";
import { createFileRoute } from "@tanstack/react-router";
import yaml from "yaml";

import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

function getBaseUrl(request: Request): string {
  const host = request.headers.get("host") || "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

export const Route = createFileRoute("/api/v1/spec")({
  server: {
    handlers: {
      GET: withApiAuth(
        async ({ request }) => {
          try {
            const tenant = Tenant.current();
            const specFile =
              tenant.namespace === TENANT_NAMESPACES.OPTIMISM
                ? "oas_v1.yaml"
                : "api_v1.yaml";
            const fp = path.join(process.cwd(), "spec", specFile);
            const data = fs.readFileSync(fp, "utf8");

            const headers = new Headers();
            headers.set("Content-Type", "application/x-yaml");

            if (specFile === "api_v1.yaml") {
              const baseUrl = getBaseUrl(request);
              const spec = yaml.parse(data);
              spec.servers = [{ url: baseUrl + "/api/v1" }];
              const modifiedData = yaml.stringify(spec);
              return new Response(modifiedData, { headers, status: 200 });
            }
            return new Response(data, { headers, status: 200 });
          } catch (err) {
            console.error(err);
            return new Response(JSON.stringify(`{result: "error"}`), {
              status: 500,
            });
          }
        },
        { skipAuth: true }
      ),
    },
  },
});
