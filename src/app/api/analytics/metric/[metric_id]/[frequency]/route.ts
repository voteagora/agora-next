import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { cache } from "react";

type MetricValue = {
  day: string;
  date: string;
  ts: number;
  value: number;
};

// TODO - merge this with the code used in Token Balances, after that
//        PR is merged.
function frequencyToDates(
  frequency: string,
  timeCol: string
): {
  lookback: number;
  skipCrit: string;
} {
  const periodLowerCase = frequency.toLowerCase();

  let lookback: number;
  let skipCrit: string;

  switch (periodLowerCase) {
    case "24h":
      lookback = 90;
      skipCrit = "1=1";
      break;
    case "7d":
      lookback = 180;
      skipCrit = `extract(DOW from (${timeCol}) = extract(DOW from current_date)`;
      break;
    case "1mo":
      lookback = 365;
      skipCrit = `extract(DAY from (${timeCol}) = 1`;
      break;
    case "3mo":
      lookback = 365;
      skipCrit = `extract(DAY from ${timeCol}) = 1 AND mod(extract(MONTH from ${timeCol}), 3) = 0`;
      break;
    case "1y":
      lookback = 365 * 2;
      skipCrit = `extract(DAY from ${timeCol}) = 31 AND extract(MONTH from ${timeCol}) = 12`;
      break;
    default:
      throw new Error("Invalid frequency value");
  }

  return { lookback, skipCrit };
}

async function getMetricTS(metricId: string, frequency: string) {
  const { namespace } = Tenant.current();

  let availableMetrics = [
    "total_votable_supply",
    "majority_threshold",

    "quorum_threshold",
    "quorum_thresh_stalemate", // Out of spec, I just thought it might be a cool overlay to add if we had time.

    "weight_of_fraction_of_active_delegates", // Out of spec, just might be a cool feature.
    "fraction_of_active_delegates",

    "weight_of_fraction_of_large_active_delegates", // Out of spec, just might be a cool feature.
    "fraction_of_large_active_delegates",
  ];

  if (!availableMetrics.includes(metricId)) {
    throw new Error(
      `Metric '${metricId}' not valid, expected one of '${availableMetrics.join(", ")}'`
    );
  }

  const { lookback, skipCrit } = frequencyToDates(frequency, "block_date");

  const QRY = `SELECT block_date AS day,
                      TO_CHAR(block_date, 'YYYY-MM-DD') date,
                      extract(epoch from block_date) as ts,
                       value
                FROM   alltenant.dao_engagement_metrics
                WHERE  metric = '${metricId}'
                   AND tenant = '${namespace}' 
                   AND block_date >= (CURRENT_DATE - INTERVAL '${lookback} day')
                   AND ${skipCrit}`;

  const result = await prisma.$queryRawUnsafe<MetricValue[]>(QRY);

  return { result };
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
