import { prismaWeb2Client } from "@/app/lib/prisma";
import { checkCowrieVerification } from "@/lib/cowrie";
import {
  COWRIE_VERIFICATION_COMPLETED_KEY,
  EXECUTION_TRANSACTIONS_KEY,
  extractPayeeFromMetadata,
  FORM_COMPLETED_KEY,
  normalizeBoolean,
} from "@/lib/taxFormUtils";
import Tenant from "@/lib/tenant/tenant";

export type ProposalTaxFormMetadata = Record<string, unknown>;

export type ExecutionTransaction = {
  id: string;
  transaction_hash: string;
  chain_id: number;
  executed_by: string;
  executed_at: string;
};

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

  // Fetch metadata and execution transactions in parallel
  const [metadataRows, executionTransactions] = await Promise.all([
    (prismaWeb2Client as any).proposalMetadataKv.findMany({
      where: {
        dao_slug: slug,
        proposalId,
      },
      select: {
        key: true,
        value: true,
      },
    }),
    (prismaWeb2Client as any).proposalExecutionTransaction.findMany({
      where: {
        tenant: slug.toLowerCase(),
        proposal_id: proposalId,
      },
      select: {
        id: true,
        transaction_hash: true,
        chain_id: true,
        executed_by: true,
        executed_at: true,
      },
      orderBy: {
        executed_at: "desc",
      },
    }),
  ]);

  const metadata: ProposalTaxFormMetadata = {};
  metadataRows.forEach(
    ({ key, value }: { key: string; value: string | null }) => {
      metadata[key] = value;
    }
  );

  // Add execution transactions to metadata
  if (executionTransactions && executionTransactions.length > 0) {
    metadata[EXECUTION_TRANSACTIONS_KEY] = executionTransactions.map(
      (tx: {
        id: string;
        transaction_hash: string;
        chain_id: number;
        executed_by: string;
        executed_at: Date;
      }) => ({
        id: tx.id,
        transaction_hash: tx.transaction_hash,
        chain_id: tx.chain_id,
        executed_by: tx.executed_by,
        executed_at: tx.executed_at.toISOString(),
      })
    );
  }

  const provider = (taxFormToggle?.config as { provider?: string } | undefined)
    ?.provider;

  const isCowrieEnabled = provider === "cowrie";

  if (!isTaxFormEnabled || !isCowrieEnabled) {
    return metadata;
  }

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
