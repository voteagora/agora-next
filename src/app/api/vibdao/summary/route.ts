import { getDashboardSummary } from '@/lib/vibdao/data';

export async function GET() {
  return Response.json(await getDashboardSummary());
}
