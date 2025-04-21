import { notFound } from "next/navigation";
import { cache } from "react";
import {
  PaginatedResult,
  paginateResult,
  PaginationParams,
} from "@/app/lib/pagination";
import { parseProposal } from "@/lib/proposalUtils";
import { prismaWeb2Client } from "@/app/lib/prisma";
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
import { Block } from "ethers";
import { withMetrics } from "@/lib/metricWrapper";
import { unstable_cache } from "next/cache";
import { ScopeData } from "@/lib/types";
import { getPublicClient } from "@/lib/viem";

async function getProposals({
  filter,
  pagination,
}: {
  filter: string;
  pagination: PaginationParams;
}): Promise<PaginatedResult<Proposal[]>> {
  return withMetrics(
    "getProposals",
    async () => {
      try {
        const { namespace, contracts, ui } = Tenant.current();

        const getProposalsExecution = doInSpan(
          { name: "getProposals" },
          async () =>
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

        const latestBlockPromise: Promise<Block> = ui.toggle(
          "use-l1-block-number"
        )?.enabled
          ? contracts.providerForTime?.getBlock("latest")
          : contracts.token.provider.getBlock("latest");

        const [proposals, latestBlock, votableSupply] = await Promise.all([
          getProposalsExecution,
          latestBlockPromise,
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
      } catch (error) {
        throw error;
      }
    },
    { filter }
  );
}

async function getProposal(proposalId: string) {
  return withMetrics("getProposal", async () => {
    const { namespace, contracts, ui } = Tenant.current();

    const latestBlockPromise: Promise<Block> = ui.toggle("use-l1-block-number")
      ?.enabled
      ? contracts.providerForTime?.getBlock("latest")
      : contracts.token.provider.getBlock("latest");

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

    const latestBlock = await latestBlockPromise;

    const isPending =
      !proposal.start_block ||
      !latestBlock ||
      Number(proposal.start_block) > latestBlock.number;

    const quorum = isPending ? null : await fetchQuorumForProposal(proposal);

    return parseProposal(
      proposal,
      latestBlock,
      quorum ?? null,
      BigInt(votableSupply)
    );
  });
}

async function getProposalTypes() {
  return withMetrics("getProposalTypes", async () => {
    const { namespace, contracts } = Tenant.current();

    if (!contracts.proposalTypesConfigurator) {
      return [];
    }

    return await findProposalType({
      namespace,
      contract: contracts.proposalTypesConfigurator.address,
    });
  });
}

async function getScopes() {
  return withMetrics("getScopes", async () => {
    const { contracts } = Tenant.current();
    if (!contracts.supportScopes) {
      return [];
    }
    const configuratorContract = contracts.proposalTypesConfigurator;
    // TODO: remove this once we have a real endpoint
    const response = await fetch("http://localhost:8004/v1/scopes");
    const data = await response.json();

    const enriched = await Promise.all(
      data.scopes?.map(async (scope: ScopeData) => {
        const config = {
          address: configuratorContract?.address as `0x${string}`,
          abi: configuratorContract?.abi,
          functionName: "assignedScopes",
          args: [scope.proposal_type_id, `0x${scope.scope_key}`],
          chainId: configuratorContract?.chain.id,
        };
        const client = getPublicClient();
        const contractData = await client.readContract(config);

        if (!contractData) {
          return {
            ...scope,
            parameters: [],
            comparators: [],
            types: [],
            exists: false,
          };
        }

        const scopes = contractData as any[];
        const firstScope = scopes[0];

        if (!firstScope) {
          return {
            ...scope,
            parameters: [],
            comparators: [],
            types: [],
            exists: false,
          };
        }

        return {
          ...scope,
          parameters: firstScope.parameters || [],
          comparators: firstScope.comparators || [],
          types: firstScope.types || [],
          exists: firstScope.exists || false,
        };
      })
    );
    return enriched as ScopeData[];
  });
}

async function getDraftProposals(address: `0x${string}`) {
  return withMetrics("getDraftProposals", async () => {
    const { contracts } = Tenant.current();
    return await prismaWeb2Client.proposalDraft.findMany({
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
  });
}

async function getDraftProposalForSponsor(address: `0x${string}`) {
  return withMetrics("getDraftProposalForSponsor", async () => {
    const { contracts } = Tenant.current();
    return await prismaWeb2Client.proposalDraft.findMany({
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
  });
}

async function getTotalProposalsCount(): Promise<number> {
  return withMetrics("getTotalProposalsCount", async () => {
    const { namespace, contracts } = Tenant.current();
    return getProposalsCount({
      namespace,
      contract: contracts.governor.address,
    });
  });
}

export const fetchProposalsCount = cache(getTotalProposalsCount);
export const fetchDraftProposalForSponsor = cache(getDraftProposalForSponsor);
export const fetchDraftProposals = cache(getDraftProposals);
export const fetchProposals = cache(getProposals);
export const fetchProposal = cache(getProposal);
export const fetchProposalTypes = cache(getProposalTypes);
export const fetchScopes = cache(getScopes);
export const fetchProposalUnstableCache = unstable_cache(getProposal, [], {
  tags: ["proposal"],
  revalidate: 3600, // 1 hour
});
