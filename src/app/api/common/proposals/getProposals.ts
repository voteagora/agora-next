import { notFound } from "next/navigation";
import { cache } from "react";
import {
  PaginatedResult,
  paginateResult,
  PaginationParams,
} from "@/app/lib/pagination";
import { parseProposal } from "@/lib/proposalUtils";
import prisma from "@/app/lib/prisma";
import { fetchVotableSupply } from "../votableSupply/getVotableSupply";
import { fetchQuorumForProposal } from "../quorum/getQuorum";
import Tenant from "@/lib/tenant/tenant";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";
import { Proposal } from "./proposal";
import { doInSpan } from "@/app/lib/logging";

async function getProposals({
  filter,
  pagination,
}: {
  filter: string;
  pagination: PaginationParams;
}): Promise<PaginatedResult<Proposal[]>> {
  const { namespace, contracts } = Tenant.current();

  const getProposalsQuery = async (skip: number, take: number) => {
    if (filter === "relevant") {
      return prisma[`${namespace}Proposals`].findMany({
        take,
        skip,
        orderBy: {
          ordinal: "desc",
        },
        where: {
          contract: contracts.governor.address,
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
          contract: contracts.governor.address,
        },
      });
    }
  };

  const getProposalsExecution = doInSpan({ name: "getProposals" }, async () =>
    paginateResult(
      (skip: number, take: number) => getProposalsQuery(skip, take),
      pagination
    )
  );

  const [proposals, latestBlock, votableSupply] = await Promise.all([
    getProposalsExecution,
    contracts.token.provider.getBlock("latest"),
    fetchVotableSupply(),
  ]);

  const resolvedProposals = await Promise.all(
    proposals.data.map(async (proposal) => {
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
    meta: proposals.meta,
    data: resolvedProposals,
  };
}

async function getProposal(proposalId: string) {
  const { namespace, contracts } = Tenant.current();
  const getProposalExecution = doInSpan({ name: "getProposal" }, async () =>
    prisma[`${namespace}Proposals`].findFirst({
      where: { proposal_id: proposalId, contract: contracts.governor.address },
    })
  );

  const [proposal, votableSupply] = await Promise.all([
    getProposalExecution,
    fetchVotableSupply(),
  ]);

  if (!proposal) {
    return notFound();
  }

  const [latestBlock, quorum] = await Promise.all([
    contracts.token.provider.getBlock("latest"),
    fetchQuorumForProposal(proposal),
  ]);

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

async function getDraftProposals(address: `0x${string}`) {
  const { contracts } = Tenant.current();
  return await prisma.proposalDraft.findMany({
    where: {
      author_address: address,
      chain_id: contracts.governor.chain.id,
      contract: contracts.governor.address.toLowerCase(),
      stage: {
        in: [
          PrismaProposalStage.ADDING_TEMP_CHECK,
          PrismaProposalStage.DRAFTING,
          PrismaProposalStage.ADDING_GITHUB_PR,
          PrismaProposalStage.AWAITING_SUBMISSION,
        ],
      },
    },
    include: {
      transactions: true,
    },
  });
}

async function getDraftProposalForSponsor(address: `0x${string}`) {
  const { contracts } = Tenant.current();
  return await prisma.proposalDraft.findMany({
    where: {
      sponsor_address: address,
      chain_id: contracts.governor.chain.id,
      contract: contracts.governor.address.toLowerCase(),
      stage: {
        in: [
          PrismaProposalStage.ADDING_TEMP_CHECK,
          PrismaProposalStage.DRAFTING,
          PrismaProposalStage.ADDING_GITHUB_PR,
          PrismaProposalStage.AWAITING_SUBMISSION,
        ],
      },
    },
    include: {
      transactions: true,
    },
  });
}

export const fetchDraftProposalForSponsor = cache(getDraftProposalForSponsor);
export const fetchDraftProposals = cache(getDraftProposals);
export const fetchProposals = cache(getProposals);
export const fetchProposal = cache(getProposal);
export const fetchProposalTypes = cache(getProposalTypes);
