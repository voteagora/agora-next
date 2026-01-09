import { prismaWeb2Client } from "@/app/lib/prisma";
import { checkCowrieVerification } from "@/lib/cowrie";
import {
  COWRIE_VERIFICATION_COMPLETED_KEY,
  extractPayeeFromMetadata,
  FORM_COMPLETED_KEY,
  normalizeBoolean,
} from "@/lib/taxFormUtils";
import Tenant from "@/lib/tenant/tenant";

export type ProposalTaxFormMetadata = Record<string, unknown>;

export async function fetchProposalTaxFormMetadata(
  proposalId: string
): Promise<ProposalTaxFormMetadata> {
  const { slug, ui } = Tenant.current();

  const taxFormToggle =
    ui.toggle("tax-form") ?? ui.toggle("tax-form-banner") ?? undefined;
  const isTaxFormEnabled = taxFormToggle?.enabled ?? false;
  if (!isTaxFormEnabled) {
    return {};
  }

  const rows = await (prismaWeb2Client as any).proposalMetadataKv.findMany({
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
  rows.forEach(({ key, value }: { key: string; value: string | null }) => {
    metadata[key] = value;
  });

  const { payeeAddress } = extractPayeeFromMetadata(metadata);
  if (!payeeAddress) {
    return metadata;
  }

  const verificationCompleted = await checkCowrieVerification(payeeAddress);
  if (verificationCompleted === null) {
    return metadata;
  }

  metadata[COWRIE_VERIFICATION_COMPLETED_KEY] = verificationCompleted;
  if (verificationCompleted) {
    metadata[FORM_COMPLETED_KEY] =
      normalizeBoolean(metadata[FORM_COMPLETED_KEY]) || verificationCompleted;
  }

  return metadata;
}
