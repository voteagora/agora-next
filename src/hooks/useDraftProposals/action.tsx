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
      ...(ownerOnly && {
        OR: [
          { is_public: true },
          { approved_sponsors: { some: { sponsor_address: address ?? "" } } },
        ],
      }),
      author_address: address ?? "",
      stage: PrismaProposalStage.AWAITING_SPONSORSHIP,
      chain_id: contracts.governor.chain.id,
      contract: contracts.governor.address.toLowerCase(),
    },
    include: {
      transactions: true,
      approved_sponsors: true,
      votes: true,
    },
  });
};

export default action;
