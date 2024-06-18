import { notFound } from "next/navigation";
import { cache } from "react";
import { paginateResult } from "@/app/lib/pagination";
import { parseProposal } from "@/lib/proposalUtils";
import prisma from "@/app/lib/prisma";
import { fetchVotableSupply } from "../votableSupply/getVotableSupply";
import { fetchQuorumForProposal } from "../quorum/getQuorum";
import Tenant from "@/lib/tenant/tenant";

async function getProposals({
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

  const { meta, data: proposals } = await paginateResult(
    (skip: number, take: number) => {
      if (filter === "relevant") {
        return prisma[`${namespace}Proposals`].findMany({
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
        return prisma[`${namespace}Proposals`].findMany({
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

  const latestBlock = await contracts.token.provider.getBlock("latest");
  const votableSupply = await fetchVotableSupply();

  const resolvedProposals = Promise.all(
    proposals.map(async (proposal) => {
      const quorum = await fetchQuorumForProposal(proposal);
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

async function getProposal(proposal_id: string) {
  const { namespace, contracts } = Tenant.current();
  const proposal = await prisma[`${namespace}Proposals`].findFirst({
    where: { proposal_id },
  });

  if (!proposal) {
    return notFound();
  }

  const latestBlock = await contracts.token.provider.getBlock("latest");
  const quorum = await fetchQuorumForProposal(proposal);
  const votableSupply = await fetchVotableSupply();

  return parseProposal(
    proposal,
    latestBlock,
    quorum ?? null,
    BigInt(votableSupply)
  );
}

async function getProposalTypes() {
  const { namespace, contracts } = Tenant.current();

  return prisma[`${namespace}ProposalTypes`].findMany({
    where: {
      contract: contracts.proposalTypesConfigurator!.address,
      name: {
        not: "",
      },
    },
  });
}

export const fetchProposals = cache(getProposals);
export const fetchProposal = cache(getProposal);
export const fetchProposalTypes = cache(getProposalTypes);
