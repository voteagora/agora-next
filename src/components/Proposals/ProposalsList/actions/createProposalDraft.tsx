"use server";

import prisma from "@/app/lib/prisma";
import { DaoSlug } from "@prisma/client";

async function createProposalDraft(address: `0x${string}`) {
  const proposal = await prisma.proposalDraft.create({
    data: {
      temp_check_link: "",
      proposal_type: "executable",
      title: "",
      description: "",
      abstract: "",
      audit_url: "",
      author_address: address,
      sponsor_address: "",
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
