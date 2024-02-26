import { notFound } from "next/navigation";
import { paginatePrismaResult } from "@/app/lib/pagination";
import { parseProposal } from "@/lib/proposalUtils";
import prisma from "@/app/lib/prisma";
import provider from "@/app/lib/provider";
import { contracts } from "@/lib/contracts/contracts";
import { getVotableSupplyForNamespace } from "../votableSupply/getVotableSupply";
import { getQuorumForProposalForNamespace } from "../quorum/getQuorum";
import Tenant from "@/lib/tenant";

export async function getProposalsForNamespace({
  filter,
  namespace,
  page = 1,
}: {
  filter: string;
  namespace: "optimism";
  page: number;
}) {

  const pageSize = 10;

  const tenant = Tenant.getInstance();

  const prodDataOnly = tenant.isProd && {
    contract: tenant.contracts().governor.address.toLowerCase(),
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
    pageSize
  );

  const latestBlock = await provider.getBlockNumber();
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

  const latestBlock = await provider.getBlockNumber();
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
