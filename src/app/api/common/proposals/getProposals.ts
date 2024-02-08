import { notFound } from "next/navigation";
import { paginatePrismaResult } from "@/app/lib/pagination";
import { parseProposal } from "@/lib/proposalUtils";
import prisma from "@/app/lib/prisma";
import provider from "@/app/lib/provider";
import { contracts } from "@/lib/contracts/contracts";
import { getVotableSupplyForNamespace } from "../votableSupply/getVotableSupply";
import { getQuorumForProposalForNamespace } from "../quorum/getQuorum";

export async function getProposalsForNamespace({
  page = 1,
  namespace,
}: {
  page: number;
  namespace: "optimism";
}) {
  const pageSize = 10;

  const prodDataOnly = process.env.NEXT_PUBLIC_AGORA_ENV === "prod" && {
    contract: contracts(namespace).governor.address.toLowerCase(),
  };

  const { meta, data: proposals } = await paginatePrismaResult(
    (skip: number, take: number) =>
      prisma[`${namespace}Proposals`].findMany({
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
  const votableSupply = await getVotableSupplyForNamespace({ namespace });

  const resolvedProposals = Promise.all(
    proposals.map(async (proposal) => {
      const quorum = await getQuorumForProposalForNamespace({
        proposal,
        namespace,
      });
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

export async function getProposalForNamespace({
  proposal_id,
  namespace,
}: {
  proposal_id: string;
  namespace: "optimism";
}) {
  const proposal = await prisma[`${namespace}Proposals`].findFirst({
    where: { proposal_id },
  });

  if (!proposal) {
    return notFound();
  }

  const latestBlock = await provider.getBlock("latest");
  const quorum = await getQuorumForProposalForNamespace({
    proposal,
    namespace,
  });
  const votableSupply = await getVotableSupplyForNamespace({ namespace });

  return parseProposal(proposal, latestBlock, quorum, BigInt(votableSupply));
}

export async function getProposalTypesForNamespace({
  namespace,
}: {
  namespace: "optimism";
}) {
  return prisma[`${namespace}ProposalTypes`].findMany({
    where: {
      contract:
        contracts(namespace).proposalTypesConfigurator.address.toLowerCase(),
    },
  });
}
