import { z } from 'zod';
import { getProposalMetadata, upsertProposalMetadata } from '@/lib/vibdao/data';

const bodySchema = z.object({
  title: z.string().min(1),
  summary: z.string().nullable().optional(),
  body: z.string().nullable().optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ proposalId: string }> }) {
  const { proposalId } = await params;
  const metadata = await getProposalMetadata(proposalId);
  return Response.json(metadata);
}

export async function POST(request: Request, { params }: { params: Promise<{ proposalId: string }> }) {
  const { proposalId } = await params;
  const parsed = bodySchema.parse(await request.json());
  const metadata = await upsertProposalMetadata({ proposalId, ...parsed });
  return Response.json(metadata);
}
