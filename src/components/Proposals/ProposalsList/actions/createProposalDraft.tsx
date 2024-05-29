"use server";

import prisma from "@/app/lib/prisma";
import { DaoSlug } from "@prisma/client";
import { DRAFT_STAGES_FOR_TENANT } from "@/app/proposals/draft/utils/stages";

async function createProposalDraft(address: `0x${string}`) {
  // TODO: need to generalize this as well -- this is the high level idea though...
  const firstStage = DRAFT_STAGES_FOR_TENANT[0];
  console.log(firstStage);

  const proposal = await prisma.proposalDraft.create({
    data: {
      temp_check_link: "",
      title: "",
      description: "",
      abstract: "",
      audit_url: "",
      author_address: address,
      sponsor_address: "",
      stage: firstStage.stage,
      // TODO: need a way to generalize this to the current tenant
      dao: {
        connectOrCreate: {
          where: {
            dao_slug: DaoSlug.ENS,
          },
          create: {
            dao_slug: DaoSlug.ENS,
            name: "ENS",
          },
        },
      },
    },
  });

  return proposal;
}

export default createProposalDraft;
