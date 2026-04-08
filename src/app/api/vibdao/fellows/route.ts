import { getFellows } from '@/lib/vibdao/data';

export async function GET() {
  return Response.json(await getFellows());
}
