import { notFound } from "next/navigation";
import { cache } from "react";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";
import { Proposal } from "./proposal";
import { getProposalsCount } from "@/lib/prismaUtils";

import { withMetrics } from "@/lib/metricWrapper";
import { unstable_cache } from "next/cache";
import { getProposalData } from "@/features/proposals/data/repositories/getProposal";
import { getPaginatedProposalsData } from "@/features/proposals/data/repositories/getProposals";
import { getProposalTypesData } from "@/features/proposals/data/repositories/getProposalTypes";

export async function getProposals({
  filter,
  pagination,
  type,
}: {
  filter: string;
  pagination: PaginationParams;
  type?: string;
}): Promise<PaginatedResult<Proposal[]>> {
  return withMetrics(
    "getProposals",
    async () => {
      try {
        const { namespace, contracts, ui } = Tenant.current();
        return await getPaginatedProposalsData({
          filter,
          pagination,
          type,
          namespace,
          contracts,
          ui,
        });
      } catch (error) {
        console.error("Error fetching proposals:", error);
        throw error;
      }
    },
    { filter }
  );
}

async function getProposal(proposalId: string) {
  return withMetrics("getProposal", async () => {
    const { namespace, contracts, ui } = Tenant.current();
    const proposal = await getProposalData({
      proposalId,
      namespace,
      contracts,
      ui,
    });

    if (!proposal) {
      return notFound();
    }
    return proposal;
  });
}

async function getProposalTypes() {
  return withMetrics("getProposalTypes", async () => {
    const { namespace, contracts, ui } = Tenant.current();
    return await getProposalTypesData({
      namespace,
      contracts,
      ui,
    });
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
        transactions: {
          orderBy: { order: "asc" },
        },
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
        transactions: {
          orderBy: { order: "asc" },
        },
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
export const fetchProposalUnstableCache = unstable_cache(getProposal, [], {
  tags: ["proposal"],
  revalidate: 3600, // 1 hour
});
