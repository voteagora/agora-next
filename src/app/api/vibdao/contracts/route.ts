import { getClientContracts } from '@/lib/vibdao/contracts';

export async function GET() {
  return Response.json(getClientContracts());
}
