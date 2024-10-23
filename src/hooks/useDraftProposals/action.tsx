"use server";

import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";

const action = async (address: `0x${string}`, ownerOnly = false) => {
  const { contracts } = Tenant.current();
  return await prisma.proposalDraft.findMany({
    where: {
      ...(ownerOnly
        ? {
            author_address: address,
          }
        : {
            OR: [
              { is_public: true },
              { author_address: address },
              { approved_sponsors: { some: { sponsor_address: address } } },
            ],
          }),
      chain_id: contracts.governor.chain.id,
      contract: contracts.governor.address.toLowerCase(),
      stage: {
        in: [
          PrismaProposalStage.ADDING_TEMP_CHECK,
          PrismaProposalStage.DRAFTING,
          PrismaProposalStage.ADDING_GITHUB_PR,
          PrismaProposalStage.AWAITING_SUBMISSION,
        ],
      },
    },
    include: {
      transactions: true,
    },
  });
};

export default action;
