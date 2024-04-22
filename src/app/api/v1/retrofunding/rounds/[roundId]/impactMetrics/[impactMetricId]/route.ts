import { fetchImpactMetricApi } from "@/app/api/common/impactMetrics/getImpactMetrics";

export async function GET(
  request: Request,
  route: {
    params: {
      roundId: string;
      ballotCasterAddressOrEns: string;
      impactMetricId: string;
    };
  }
) {
  const { roundId, ballotCasterAddressOrEns, impactMetricId } = route.params;
  const impactMetrics = await fetchImpactMetricApi(impactMetricId);
  return new Response(JSON.stringify(impactMetrics), {
    status: 200,
  });
}
