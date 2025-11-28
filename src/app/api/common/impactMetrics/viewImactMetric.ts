import { addressOrEnsNameWrap } from "../utils/ensName";
import { prismaWeb2Client } from "@/app/lib/web2";

const viewImpactMetric = async ({
  addressOrENSName,
  metricId,
}: {
  addressOrENSName: string;
  metricId: string;
}) =>
  addressOrEnsNameWrap(viewImpactMetricForAddress, addressOrENSName, {
    metricId,
  });

async function viewImpactMetricForAddress({
  address,
  metricId,
}: {
  address: string;
  metricId: string;
}) {
  return prismaWeb2Client.metrics_views.upsert({
    where: {
      metric_id_address: {
        metric_id: metricId,
        address,
      },
    },
    update: {},
    create: {
      metric_id: metricId,
      address,
    },
  });
}

export const viewImpactMetricApi = viewImpactMetric;
