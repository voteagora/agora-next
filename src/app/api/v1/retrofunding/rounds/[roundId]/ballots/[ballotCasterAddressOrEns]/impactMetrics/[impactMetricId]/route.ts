export async function DELETE(
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
  return new Response(null, {
    status: 200,
  });
}
