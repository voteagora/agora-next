import { getProposalById } from '@/lib/vibdao/data';

export async function GET(_: Request, { params }: { params: Promise<{ proposalId: string }> }) {
  const { proposalId } = await params;
  const proposal = await getProposalById(proposalId);
  if (!proposal) {
    return new Response('Not found', { status: 404 });
  }
  return Response.json(proposal);
}
