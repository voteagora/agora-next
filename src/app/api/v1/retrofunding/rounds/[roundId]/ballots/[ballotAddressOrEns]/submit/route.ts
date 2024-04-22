import { fetchBallot } from "@/app/api/common/ballots/getBallots";

export async function POST(
  request: Request,
  route: { params: { roundId: string; ballotAddressOrEns: string } }
) {
  const { roundId, ballotAddressOrEns } = route.params;
  const ballot = await fetchBallot(roundId, ballotAddressOrEns);
  return new Response(JSON.stringify(ballot), {
    status: 200,
  });
}
