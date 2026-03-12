"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { PLMConfig } from "@/app/proposals/draft/types";
import { verifyJwtAndGetAddress } from "@/lib/siweAuth.server";

export { verifyJwtAndGetAddress };

function isAddressAuthorizedForDraft(
  address: string,
  draftAuthorAddress: string
): boolean {
  const addressLower = address.toLowerCase();
  const authorLower = draftAuthorAddress.toLowerCase();

  if (addressLower === authorLower) {
    return true;
  }

  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");
  const offchainCreators =
    (plmToggle?.config as PLMConfig)?.offchainProposalCreator || [];

  return offchainCreators.some(
    (creator) => creator.toLowerCase() === addressLower
  );
}

export async function verifyOwnerAndJwtForDraft(
  draftProposalId: number,
  jwt: string
) {
  const address = await verifyJwtAndGetAddress(jwt);
  if (!address) return { ok: false as const, reason: "Invalid token" };
  const draft = await prismaWeb2Client.proposalDraft.findUnique({
    where: { id: draftProposalId },
    select: { id: true, author_address: true },
  });
  if (!draft) return { ok: false as const, reason: "Draft not found" };
  if (!isAddressAuthorizedForDraft(address, draft.author_address)) {
    return { ok: false as const, reason: "Unauthorized" };
  }
  return { ok: true as const };
}
