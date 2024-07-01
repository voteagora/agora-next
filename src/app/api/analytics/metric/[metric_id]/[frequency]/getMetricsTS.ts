import { MetricTimeSeriesValue } from "@/lib/types";
import Tenant from "@/lib/tenant/tenant";
import { frequencyToLookbackDayCount } from "@/app/api/common/utils/frequencyHandling";
import prisma from "@/app/lib/prisma";
import { cache } from "react";

async function getMetricTS(
  metricId: string,
  frequency: string
): Promise<{ result: MetricTimeSeriesValue[] }> {
  const { namespace } = Tenant.current();

  if (frequency == "latest") {
    const { result } = await getMetricTS(metricId, "3d");
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

    "fraction_of_active_delegates",
    "fraction_of_large_active_delegates",

    "quorum_thresh_stalemate", // Out of spec, I just thought it might be a cool overlay to add if we had time.
    "weight_of_fraction_of_active_delegates", // Out of spec, just might be a cool feature.
    "weight_of_fraction_of_large_active_delegates", // Out of spec, just might be a cool feature.
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

  const data: MetricTimeSeriesValue[] =
    await prisma.$queryRawUnsafe<MetricTimeSeriesValue[]>(QRY);

  return { result: data };
}

export const apiFetchMetricTS = cache(getMetricTS);
