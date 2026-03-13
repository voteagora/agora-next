"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import { verifyJwtAndGetAddress } from "@/app/proposals/draft/actions/siweAuth";
import Tenant from "@/lib/tenant/tenant";
import { PLMConfig } from "@/app/proposals/draft/types";

async function createProposalDraft(
  address: `0x${string}`,
  params: { jwt: string }
) {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");

  if (!plmToggle) {
    throw new Error(
      `Proposal lifecycle toggle not found for tenant ${tenant.ui.title}`
    );
  }

  const verifiedAddress = await verifyJwtAndGetAddress(params.jwt);
  if (!verifiedAddress) {
    throw new Error("Invalid token");
  }

  if (verifiedAddress.toLowerCase() !== address.toLowerCase()) {
    throw new Error("Token address mismatch");
  }

  const config = plmToggle.config as PLMConfig;
  const firstStage = config.stages[0];

  const proposal = await prismaWeb2Client.proposalDraft.create({
    data: {
      contract:
        tenant.contracts.governor.address.toLowerCase() as `0x${string}`,
      chain_id: tenant.contracts.governor.chain.id,
      temp_check_link: "",
      title: "",
      abstract: "",
      audit_url: "",
      author_address: address,
      sponsor_address: "",
      stage: firstStage.stage,
      dao_slug: tenant.slug,
    },
  });

  return proposal;
}

export default createProposalDraft;
