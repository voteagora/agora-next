import { notFound } from "next/navigation";
import { paginatePrismaResult } from "@/app/lib/pagination";
import { parseProposal } from "@/lib/proposalUtils";
import prisma from "@/app/lib/prisma";
import provider from "@/app/lib/provider";
import { getVotableSupplyForNamespace } from "../votableSupply/getVotableSupply";
import { getQuorumForProposalForNamespace } from "../quorum/getQuorum";
import Tenant from "@/lib/tenant";

export async function getProposals({
                                     filter,
                                     page = 1,
                                   }: {
  filter: string;
  page: number;
}) {

  const pageSize = 10;

  const tenant = Tenant.getInstance();
  const prodDataOnly = tenant.isProd && {
    contract: tenant.contracts().governor.address,
  };

  const { meta, data: proposals } = await paginatePrismaResult(
    (skip: number, take: number) => {
      if (filter === "relevant") {
        return prisma[`${tenant.namespace}Proposals`].findMany({
          take,
          skip,
          orderBy: {
            ordinal: "desc",
          },
          where: {
            ...(prodDataOnly || {}),
            cancelled_block: null,
          },
        });
      } else {
        return prisma[`${tenant.namespace}Proposals`].findMany({
          take,
          skip,
          orderBy: {
            ordinal: "desc",
          },
          where: {
            ...(prodDataOnly || {}),
          },
        });
      }
    },
    page,
    pageSize,
  );

  const latestBlock = await provider.getBlockNumber();
  const votableSupply = await getVotableSupplyForNamespace({ namespace: tenant.namespace });

  const resolvedProposals = Promise.all(
    proposals.map(async (proposal) => {
      const quorum = await getQuorumForProposalForNamespace({
        proposal,
        namespace: tenant.namespace,
      });
      return parseProposal(
        proposal,
        latestBlock,
        quorum,
        BigInt(votableSupply),
      );
    }),
  );

  return {
    meta,
    proposals: await resolvedProposals,
  };
}

export async function getProposal(proposal_id: string) {

  const tenant = Tenant.getInstance();
  const proposal = await prisma[`${tenant.namespace}Proposals`].findFirst({
    where: { proposal_id },
  });

  if (!proposal) {
    return notFound();
  }

  const latestBlock = await provider.getBlockNumber();
  const quorum = await getQuorumForProposalForNamespace({
    proposal,
    namespace: tenant.namespace,
  });
  const votableSupply = await getVotableSupplyForNamespace({ namespace: tenant.namespace });

  return parseProposal(proposal, latestBlock, quorum, BigInt(votableSupply));
}

export async function getProposalTypes() {

  const tenant = Tenant.getInstance();

  return prisma[`${tenant.namespace}ProposalTypes`].findMany({
    where: {
      contract: tenant.contracts().proposalTypesConfigurator.address,
    },
  });
}
