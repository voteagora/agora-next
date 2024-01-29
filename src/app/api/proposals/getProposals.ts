import { notFound } from "next/navigation";
import { paginatePrismaResult } from "@/app/lib/pagination";
import { parseProposal } from "@/lib/proposalUtils";
import prisma from "@/app/lib/prisma";
import provider from "@/app/lib/provider";
import { OptimismContracts } from "@/lib/contracts/contracts";
import { getQuorumForProposal } from "../quorum/getQuorum";
import { getVotableSupply } from "../votableSupply/getVotableSupply";
import { DEPLOYMENT_NAME } from "@/lib/config";

export async function getProposals({ page = 1 }: { page: number }) {
  const pageSize = 10;

  const prodDataOnly = process.env.NEXT_PUBLIC_AGORA_ENV === "prod" && {
    contract: OptimismContracts.governor.address.toLowerCase(),
  };

  const { meta, data: proposals } = await paginatePrismaResult(
    (skip: number, take: number) =>
      prisma[`${DEPLOYMENT_NAME}Proposals`].findMany({
        take,
        skip,
        orderBy: {
          ordinal: "desc",
        },
        where: {
          ...(prodDataOnly || {}),
          cancelled_block: null,
        },
      }),
    page,
    pageSize
  );

  const latestBlock = await provider.getBlock("latest");
  const votableSupply = await getVotableSupply();

  const resolvedProposals = Promise.all(
    proposals.map(async (proposal) => {
      const quorum = await getQuorumForProposal(proposal);
      return parseProposal(
        proposal,
        latestBlock,
        quorum,
        BigInt(votableSupply)
      );
    })
  );

  return {
    meta,
    proposals: await resolvedProposals,
  };
}

export async function getProposal({ proposal_id }: { proposal_id: string }) {
  const proposal = await prisma[`${DEPLOYMENT_NAME}Proposals`].findFirst({
    where: { proposal_id },
  });

  if (!proposal) {
    return notFound();
  }

  const latestBlock = await provider.getBlock("latest");
  const quorum = await getQuorumForProposal(proposal);
  const votableSupply = await getVotableSupply();

  return parseProposal(proposal, latestBlock, quorum, BigInt(votableSupply));
}

export async function getProposalTypes() {
  return prisma[`${DEPLOYMENT_NAME}ProposalTypes`].findMany({
    where: {
      contract:
        OptimismContracts.proposalTypesConfigurator.address.toLowerCase(),
    },
  });
}
