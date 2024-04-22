import { fetchBallot } from "@/app/api/common/ballots/getBallots";

export async function GET(request: Request, route: { params: { roundId: string, ballotAddressOrEns: string } }) {
  const { roundId, ballotAddressOrEns } = route.params;
  const ballots = await fetchBallot(roundId, ballotAddressOrEns);
  return new Response(JSON.stringify(ballots), {
    status: 200,
  });
}
