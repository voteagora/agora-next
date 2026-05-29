import { NextResponse } from "next/server";

import { deleteExpiredSafeTrackedTransactions } from "@/lib/safeTrackedTransactions.server";
import { withApiRouteMonitoring } from "@/lib/apiMonitoring";

async function post(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { cutoff, deletedCount } =
      await deleteExpiredSafeTrackedTransactions();

    return NextResponse.json({
      deletedCount,
      cutoff: cutoff.toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to clean up expired Safe tracked transactions",
      },
      { status: 500 }
    );
  }
}

export const POST = withApiRouteMonitoring(
  "api.internal.safe.tracked_transactions.cleanup",
  post
);
