import { addressOrEnsNameWrap } from "../utils/ensName";
import prisma from "@/app/lib/prisma";

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
  return prisma.metrics_views.upsert({
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
