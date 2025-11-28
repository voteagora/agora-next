import { MetricTimeSeriesValue } from "@/lib/types";
import Tenant from "@/lib/tenant/tenant";
import { frequencyToLookbackDayCount } from "@/app/api/common/utils/frequencyHandling";
import { prismaWeb2Client } from "@/app/lib/web2";
import { cache } from "react";

async function getMetricTS(
  metricId: string,
  frequency: string
): Promise<{ result: MetricTimeSeriesValue[] }> {
  const { slug, contracts } = Tenant.current();

  const governorContract = contracts.governor.address;

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
  ];

  const isGoogleAnalyticMetric = availableGoogleMetrics.includes(metricId);
  const isChainMetric = availableChainMetrics.includes(metricId);

  let QRY: string;

  let scaler: number;

  switch (metricId) {
    case "fraction_of_active_delegates":
      scaler = 100;
      break;
    case "fraction_of_large_active_delegates":
      scaler = 100;
      break;
    default:
      scaler = 1;
      break;
  }

  if (isChainMetric) {
    const { lookback } = frequencyToLookbackDayCount(frequency);

    QRY = `SELECT block_date AS day,
                        TO_CHAR(block_date, 'YYYY-MM-DD') date,
                        (value::numeric * ${scaler})::text as value
                  FROM   alltenant.dao_engagement_metrics_cs
                  WHERE  metric = '${metricId}'
                     AND contract = '${governorContract}'
                     AND block_date >= (CURRENT_DATE - INTERVAL '${lookback} day')
                     ORDER BY date;`;
  } else if (isGoogleAnalyticMetric) {
    const { lookback } = frequencyToLookbackDayCount(frequency);

    QRY = `SELECT date AS day,
                        TO_CHAR(date, 'YYYY-MM-DD') date,
                         value
                  FROM   google.analytics
                  WHERE  metric_id = '${metricId}'
                     AND dao_slug = '${slug}' 
                     AND date >= (CURRENT_DATE - INTERVAL '${lookback} day')
                     ORDER BY date;`;
  } else {
    throw new Error(
      `Metric '${metricId}' not valid, expected either a Google Analytics Metric ('${availableGoogleMetrics.join(", ")}) or Chain Metric ('${availableChainMetrics.join(", ")}')`
    );
  }

  const data = (await prismaWeb2Client.$queryRawUnsafe(
    QRY
  )) as MetricTimeSeriesValue[];

  return { result: data };
}

export const apiFetchMetricTS = cache(getMetricTS);
