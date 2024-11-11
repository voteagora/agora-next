"use server";

import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";

const action = async (address: `0x${string}` | undefined) => {
  const { contracts } = Tenant.current();
  return await prisma.proposalDraft.findMany({
    where: {
      OR: [
        {
          author_address: address,
          stage: {
            not: {
              in: [
                PrismaProposalStage.PENDING,
                PrismaProposalStage.AWAITING_SPONSORSHIP,
                PrismaProposalStage.QUEUED,
                PrismaProposalStage.EXECUTED,
                PrismaProposalStage.CANCELED,
              ],
            },
          },
        },
      ],
      chain_id: contracts.governor.chain.id,
      contract: contracts.governor.address.toLowerCase(),
    },
    include: {
      transactions: true,
    },
  });
};

export default action;
