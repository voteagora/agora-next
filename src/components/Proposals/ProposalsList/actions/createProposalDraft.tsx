"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import { verifyAuth, type AuthParams } from "@/lib/auth/authHelpers";
import Tenant from "@/lib/tenant/tenant";
import { PLMConfig } from "@/app/proposals/draft/types";

async function createProposalDraft(address: `0x${string}`, params: AuthParams) {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");

  if (!plmToggle) {
    throw new Error(
      `Proposal lifecycle toggle not found for tenant ${tenant.ui.title}`
    );
  }

  const authResult = await verifyAuth(params, address);
  if (!authResult.success) {
    throw new Error(authResult.error);
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
      author_address: authResult.address,
      sponsor_address: "",
      stage: firstStage.stage,
      dao_slug: tenant.slug,
    },
  });

  return proposal;
}

export default createProposalDraft;
