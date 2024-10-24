"use server";

import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";

const action = async (
  address: `0x${string}` | undefined,
  ownerOnly = false
) => {
  const { contracts } = Tenant.current();
  return await prisma.proposalDraft.findMany({
    where: {
      ...(ownerOnly
        ? {
            author_address: address ?? "",
          }
        : {
            OR: [
              {
                is_public: true,
                stage: PrismaProposalStage.AWAITING_SPONSORSHIP,
              },
              {
                author_address: address ?? "",
              },
              {
                approved_sponsors: { some: { sponsor_address: address ?? "" } },
                stage: PrismaProposalStage.AWAITING_SPONSORSHIP,
              },
            ],
          }),
      chain_id: contracts.governor.chain.id,
      contract: contracts.governor.address.toLowerCase(),
    },
    include: {
      transactions: true,
      approved_sponsors: true,
    },
  });
};

export default action;
