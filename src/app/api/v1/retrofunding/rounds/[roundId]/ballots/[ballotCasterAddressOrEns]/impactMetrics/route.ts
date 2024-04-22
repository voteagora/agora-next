import { fetchImpactMetricsApi } from "@/app/api/common/impactMetrics/getImpactMetrics";

export async function GET(
  request: Request,
  route: { params: { roundId: string; ballotCasterAddressOrEns: string } }
) {
  const { roundId, ballotCasterAddressOrEns } = route.params;
  const impactMetrics = await fetchImpactMetricsApi(
    roundId,
    ballotCasterAddressOrEns
  );
  return new Response(JSON.stringify(impactMetrics), {
    status: 200,
  });
}

export async function POST(
  request: Request,
  route: { params: { roundId: string; ballotCasterAddressOrEns: string } }
) {
  const { roundId, ballotCasterAddressOrEns } = route.params;
  const impactMetrics = await fetchImpactMetricsApi(
    roundId,
    ballotCasterAddressOrEns
  );
  return new Response(JSON.stringify(impactMetrics), {
    status: 200,
  });
}
