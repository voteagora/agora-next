// export const dynamic = 'force-dynamic'; // this line is uncommented for e2e tests

import { NextRequest } from "next/server";
import Tenant from "@/lib/tenant/tenant";
import yaml from "yaml";

import fs from "fs";
import path from "path";
import { TENANT_NAMESPACES } from "@/lib/constants";

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get("host") || "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  try {
    const tenant = Tenant.current();
    const specFile =
      tenant.namespace === TENANT_NAMESPACES.OPTIMISM
        ? "oas_v1.yaml"
        : "api_v1.yaml";
    const fp = path.join(process.cwd(), "spec", specFile);
    const data = fs.readFileSync(fp, "utf8");

    // If using the new API spec, inject the base URL
    if (specFile === "api_v1.yaml") {
      const baseUrl = getBaseUrl(request);
      const spec = yaml.parse(data);

      // Inject the server URL
      spec.servers = [{ url: baseUrl + "/api/v1" }];

      // Convert back to YAML
      const modifiedData = yaml.stringify(spec);

      // set headers and return
      const headers = new Headers();
      headers.set("Content-Type", "application/x-yaml");
      return new Response(modifiedData, {
        headers,
        status: 200,
      });
    }

    // For the original spec, return as is
    const headers = new Headers();
    headers.set("Content-Type", "application/x-yaml");
    return new Response(data, {
      headers,
      status: 200,
    });
  } catch (err) {
    if (err) {
      console.error(err);
      return new Response(JSON.stringify(`{result: "error"}`), {
        status: 500,
      });
    }
  }
}
