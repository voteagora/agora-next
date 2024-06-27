import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { frequencyToLookbackDayCount } from "@/app/api/common/utils/frequencyHandling";
import { cache } from "react";

type MetricValue = {
  day: string;
  date: string;
  ts: number;
  value: any;
};

async function getMetricTS(
  metricId: string,
  frequency: string
): Promise<{ result: MetricValue[] }> {
  const { namespace } = Tenant.current();

  if (frequency == "latest") {
    const { result } = await getMetricTS(metricId, "24h");
    const lastObject = result[result.length - 1];
    return { result: [lastObject] };
  }

  let availableGoogleMetrics = [
    "activeUsers",
    "averageSessionDuration",
    "screenPageViews",
    "bounceRate",
  ];

  let availableChainMetrics = [
    "total_votable_supply",
    "majority_threshold",

    "quorum_threshold",
    "quorum_thresh_stalemate", // Out of spec, I just thought it might be a cool overlay to add if we had time.

    "weight_of_fraction_of_active_delegates", // Out of spec, just might be a cool feature.
    "fraction_of_active_delegates",

    "weight_of_fraction_of_large_active_delegates", // Out of spec, just might be a cool feature.
    "fraction_of_large_active_delegates",
  ];

  const isGoogleAnalyticMetric = availableGoogleMetrics.includes(metricId);
  const isChainMetric = availableChainMetrics.includes(metricId);

  let QRY: string;

  if (isChainMetric) {
    const { lookback } = frequencyToLookbackDayCount(frequency);

    QRY = `SELECT block_date AS day,
                        TO_CHAR(block_date, 'YYYY-MM-DD') date,
                        extract(epoch from block_date) as ts,
                         value
                  FROM   alltenant.dao_engagement_metrics
                  WHERE  metric = '${metricId}'
                     AND tenant = '${namespace}' 
                     AND block_date >= (CURRENT_DATE - INTERVAL '${lookback} day')`;
  } else if (isGoogleAnalyticMetric) {
    const { lookback } = frequencyToLookbackDayCount(frequency);

    QRY = `SELECT date AS day,
                        TO_CHAR(date, 'YYYY-MM-DD') date,
                        extract(epoch from date) as ts,
                         value
                  FROM   google.analytics_24h
                  WHERE  metric_id = '${metricId}'
                     AND tenant = '${namespace}' 
                     AND date >= (CURRENT_DATE - INTERVAL '${lookback} day')`;
  } else {
    throw new Error(
      `Metric '${metricId}' not valid, expected either a Google Analytics Metric ('${availableGoogleMetrics.join(", ")}) or Chain Metric ('${availableChainMetrics.join(", ")}')`
    );
  }

  const data: MetricValue[] = await prisma.$queryRawUnsafe<MetricValue[]>(QRY);

  return { result: data };
}

const fetchMetricTS = cache(getMetricTS);

export async function GET(request: NextRequest) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const paramParts = request.nextUrl.pathname.split("/");

  // This seems dangerous.  There must be a better way.
  // I picked up this pattern from other areas of our code base.
  const frequency = paramParts[5];
  const metricId = paramParts[4];

  try {
    const communityInfo = await fetchMetricTS(metricId, frequency);
    return NextResponse.json(communityInfo);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
