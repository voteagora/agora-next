import { getProposals } from '@/lib/vibdao/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit') ?? '50');
  return Response.json(await getProposals(limit));
}
