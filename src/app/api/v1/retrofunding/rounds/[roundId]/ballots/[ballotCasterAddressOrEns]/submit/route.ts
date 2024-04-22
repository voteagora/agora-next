import { fetchBallot } from "@/app/api/common/ballots/getBallots";

export async function POST(
  request: Request,
  route: { params: { roundId: string; ballotCasterAddressOrEns: string } }
) {
  const { roundId, ballotCasterAddressOrEns } = route.params;
  const ballot = await fetchBallot(roundId, ballotCasterAddressOrEns);
  return new Response(JSON.stringify(ballot), {
    status: 200,
  });
}
