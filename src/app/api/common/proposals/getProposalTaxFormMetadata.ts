import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";

export type ProposalTaxFormMetadata = Record<string, unknown>;

export async function fetchProposalTaxFormMetadata(
  proposalId: string
): Promise<ProposalTaxFormMetadata> {
  const { slug } = Tenant.current();

  const rows = await prismaWeb2Client.proposalTaxFormMetadata.findMany({
    where: {
      dao_slug: slug,
      proposalId,
    },
    select: {
      key: true,
      value: true,
    },
  });

  const metadata: ProposalTaxFormMetadata = {};
  rows.forEach(({ key, value }: { key: string; value: unknown }) => {
    metadata[key] = value;
  });

  return metadata;
}
