"use server";

import prisma from "@/app/lib/prisma";
import { DRAFT_STAGES_FOR_TENANT } from "@/app/proposals/draft/utils/stages";
import Tenant from "@/lib/tenant/tenant";

async function createProposalDraft(address: `0x${string}`) {
  const tenant = Tenant.current();
  // TODO: need to generalize this as well -- this is the high level idea though...
  const firstStage = DRAFT_STAGES_FOR_TENANT[0];

  const proposal = await prisma.proposalDraft.create({
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
