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
import { Proposal, ProposalPayload } from "./proposal";
import { doInSpan } from "@/app/lib/logging";
import {
  findProposal,
  findProposalType,
  findProposalsQuery,
  getProposalsCount,
} from "@/lib/prismaUtils";

async function getProposals({
  filter,
  pagination,
}: {
  filter: string;
  pagination: PaginationParams;
}): Promise<PaginatedResult<Proposal[]>> {
  const { namespace, contracts } = Tenant.current();

  const getProposalsExecution = doInSpan({ name: "getProposals" }, async () =>
    paginateResult(
      (skip: number, take: number) =>
        findProposalsQuery({
          namespace,
          skip,
          take,
          filter,
          contract: contracts.governor.address,
        }),
      pagination
    )
  );

  const [proposals, latestBlock, votableSupply] = await Promise.all([
    getProposalsExecution,
    contracts.token.provider.getBlock("latest"),
    fetchVotableSupply(),
  ]);

  const resolvedProposals = await Promise.all(
    proposals.data.map(async (proposal: ProposalPayload) => {
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
    findProposal({
      namespace,
      proposalId,
      contract: contracts.governor.address,
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

  if (!contracts.proposalTypesConfigurator) {
    return [];
  }

  const results = await findProposalType({
    namespace,
    contract: contracts.proposalTypesConfigurator.address,
  });

  return results;
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

async function getTotalProposalsCount(): Promise<number> {
  const { namespace, contracts } = Tenant.current();
  return getProposalsCount({
    namespace,
    contract: contracts.governor.address,
  });
}

export const fetchProposalsCount = cache(getTotalProposalsCount);
export const fetchDraftProposalForSponsor = cache(getDraftProposalForSponsor);
export const fetchDraftProposals = cache(getDraftProposals);
export const fetchProposals = cache(getProposals);
export const fetchProposal = cache(getProposal);
export const fetchProposalTypes = cache(getProposalTypes);
