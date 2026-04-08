import { getSalaryClaims } from '@/lib/vibdao/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit') ?? '20');
  return Response.json(await getSalaryClaims(limit));
}
