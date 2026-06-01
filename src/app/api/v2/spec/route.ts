// export const dynamic = 'force-dynamic'; // this line is uncommented for e2e tests

import { NextRequest } from "next/server";
import yaml from "yaml";

import fs from "fs";
import path from "path";

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get("host") || "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  try {
    const fp = path.join(process.cwd(), "spec", "api_v2.yaml");
    const data = fs.readFileSync(fp, "utf8");
    const spec = yaml.parse(data);
    spec.servers = [{ url: getBaseUrl(request) + "/api/v2" }];

    const headers = new Headers();
    headers.set("Content-Type", "application/x-yaml");
    return new Response(yaml.stringify(spec), {
      headers,
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ result: "error" }), {
      status: 500,
    });
  }
}
