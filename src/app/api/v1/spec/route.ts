import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/middleware/auth";
import { traceWithUserId } from "@/app/api/v1/apiUtils";

import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const fp = path.join(process.cwd(), "spec/oas_v1.yaml");
    const data = fs.readFileSync(fp, "utf8");
    // set headers
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
