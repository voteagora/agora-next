import { NextRequest, NextResponse } from "next/server";
import {
  getProposalSystemConfig,
  ProposalSystemMetrics,
} from "@/lib/config/proposalSystemConfig";

/**
 * Admin endpoint to view proposal system migration metrics
 * GET /api/v1/admin/proposal-system-metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Check for admin authentication (optional - add your auth logic here)
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // For now, just log the access attempt
      console.log("Proposal system metrics accessed without auth");
    }

    const config = getProposalSystemConfig();
    const metrics = ProposalSystemMetrics.getMetricsSummary();

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      config: {
        useNewSystem: config.useNewSystem,
        newSystemPercentage: config.newSystemPercentage,
        enableSystemComparison: config.enableSystemComparison,
        logLevel: config.logLevel,
      },
      metrics,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        deployment: process.env.VERCEL_ENV || "local",
      },
    });
  } catch (error) {
    console.error("Error fetching proposal system metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}

/**
 * Reset metrics (useful for testing)
 * POST /api/v1/admin/proposal-system-metrics/reset
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    ProposalSystemMetrics.resetMetrics();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: "Metrics reset successfully",
    });
  } catch (error) {
    console.error("Error resetting proposal system metrics:", error);
    return NextResponse.json(
      { error: "Failed to reset metrics" },
      { status: 500 }
    );
  }
}
