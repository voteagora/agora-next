import { fetchBallot } from "@/app/api/common/ballots/getBallots";

export async function GET(
  request: Request,
  route: { params: { roundId: string; ballotCasterAddressOrEns: string } }
) {
  const { roundId, ballotCasterAddressOrEns } = route.params;
  const ballots = await fetchBallot(roundId, ballotCasterAddressOrEns);
  return new Response(JSON.stringify(ballots), {
    status: 200,
  });
}
