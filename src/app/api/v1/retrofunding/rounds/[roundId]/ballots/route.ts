import { fetchBallots } from "@/app/api/common/ballots/getBallots";

export async function GET(
  request: Request,
  route: { params: { roundId: string } }
) {
  const { roundId } = route.params;
  const ballots = await fetchBallots(roundId);
  return new Response(JSON.stringify(ballots), {
    status: 200,
  });
}
