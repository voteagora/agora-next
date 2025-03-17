import { NextResponse } from "next/server";
import { fetchMetrics } from "./getMetrics";

export async function GET() {
  try {
    const metrics = await fetchMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
