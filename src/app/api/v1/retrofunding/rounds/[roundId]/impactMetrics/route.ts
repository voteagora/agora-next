import { fetchImpactMetricsApi } from "@/app/api/common/impactMetrics/getImpactMetrics";

export async function GET(
  request: Request,
  route: { params: { roundId: string } }
) {
  const { roundId } = route.params;
  const impactMetrics = await fetchImpactMetricsApi(roundId);
  return new Response(JSON.stringify(impactMetrics), {
    status: 200,
  });
}
