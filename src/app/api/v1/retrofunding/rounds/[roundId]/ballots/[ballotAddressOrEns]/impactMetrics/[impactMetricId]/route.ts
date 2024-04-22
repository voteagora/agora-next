export async function DELETE(
  request: Request,
  route: {
    params: {
      roundId: string;
      ballotAddressOrEns: string;
      impactMetricId: string;
    };
  }
) {
  const { roundId, ballotAddressOrEns, impactMetricId } = route.params;
  return new Response(null, {
    status: 200,
  });
}
