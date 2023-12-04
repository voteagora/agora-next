import { notFound } from "next/navigation";
import { paginatePrismaResult } from "@/app/lib/pagination";
import { parseProposal } from "@/lib/proposalUtils";
import prisma from "@/app/lib/prisma";
import provider from "@/app/lib/provider";

import "server-only";
import { OptimismContracts } from "@/lib/contracts/contracts";

export async function getProposals({ page = 1 }: { page: number }) {
  const pageSize = 4;

  const prodDataOnly = process.env.NEXT_PUBLIC_AGORA_ENV === "prod" && {
    contract: OptimismContracts.governor.address.toLowerCase(),
  };

  const { meta, data: proposals } = await paginatePrismaResult(
    (skip: number, take: number) =>
      prisma.proposals.findMany({
        take,
        skip,
        orderBy: {
          ordinal: "desc",
        },
        where: {
          ...(prodDataOnly || {}),
        },
      }),
    page,
    pageSize
  );

  const latestBlock = await provider.getBlock("latest");

  const resolvedProposals = Promise.all(
    proposals.map((proposal) => parseProposal(proposal, latestBlock))
  );

  return {
    meta,
    proposals: await resolvedProposals,
  };
}

export async function getProposal({ proposal_id }: { proposal_id: string }) {
  const proposal = await prisma.proposals.findFirst({
    where: { proposal_id },
  });

  if (!proposal) {
    return notFound();
  }

  const latestBlock = await provider.getBlock("latest");

  return parseProposal(proposal, latestBlock);
}
