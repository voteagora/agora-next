import { notFound } from "next/navigation";
import { paginatePrismaResult } from "@/app/lib/pagination";
import { parseProposal } from "@/lib/proposalUtils";
import prisma from "@/app/lib/prisma";
import provider from "@/app/lib/provider";
import { getVotableSupply } from "../votableSupply/getVotableSupply";
import { getQuorumForProposal } from "../quorum/getQuorum";
import Tenant from "@/lib/tenant/tenant";

export async function getProposals({
  filter,
  page = 1,
}: {
  filter: string;
  page: number;
}) {
  const pageSize = 10;

  const { namespace, contracts, isProd } = Tenant.current();
  const prodDataOnly = isProd && {
    contract: contracts.governor.address,
  };

  const { meta, data: proposals } = await paginatePrismaResult(
    (skip: number, take: number) => {
      if (filter === "relevant") {
        return (prisma as any)[`${namespace}Proposals`].findMany({
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
        return (prisma as any)[`${namespace}Proposals`].findMany({
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
  const votableSupply = await getVotableSupply();

  const resolvedProposals = Promise.all(
    proposals.map(async (proposal) => {
      const quorum = await getQuorumForProposal(proposal);
      return parseProposal(
        proposal,
        latestBlock,
        quorum ?? null,
        BigInt(votableSupply)
      );
    })
  );

  return {
    meta,
    proposals: await resolvedProposals,
  };
}

export async function getProposal(proposal_id: string) {
  const { namespace } = Tenant.current();
  const proposal = await (prisma as any)[`${namespace}Proposals`].findFirst({
    where: { proposal_id },
  });

  if (!proposal) {
    return notFound();
  }

  const latestBlock = await provider.getBlockNumber();
  const quorum = await getQuorumForProposal(proposal);
  const votableSupply = await getVotableSupply();

  return parseProposal(
    proposal,
    latestBlock,
    quorum ?? null,
    BigInt(votableSupply)
  );
}

export async function getProposalTypes() {
  const { namespace, contracts } = Tenant.current();

  return (prisma as any)[`${namespace}ProposalTypes`].findMany({
    where: {
      contract: contracts.proposalTypesConfigurator!.address,
    },
  });
}
