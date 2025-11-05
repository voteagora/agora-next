export const dynamic = 'force-dynamic'; // this line is uncommented for e2e tests

import { NextResponse } from "next/server";

export async function GET() {
  const { fetchMetrics } = await import("./getMetrics");

  try {
    const metrics = await fetchMetrics();
    return NextResponse.json(metrics);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
