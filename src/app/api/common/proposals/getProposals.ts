import { notFound } from "next/navigation";
import { cache } from "react";
import {
  PaginatedResult,
  paginateResult,
  PaginationParams,
} from "@/app/lib/pagination";
import {
  parseProposal,
  isTimestampBasedProposal,
  getStartTimestamp,
  getStartBlock,
} from "@/lib/proposalUtils";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { fetchVotableSupply } from "../votableSupply/getVotableSupply";
import { fetchQuorumForProposal } from "../quorum/getQuorum";
import Tenant from "@/lib/tenant/tenant";
import { ProposalStage as PrismaProposalStage, ProposalType } from "@prisma/client";
import { Proposal, ProposalPayload, ProposalPayloadFromDAONode, ProposalPayloadFromDB } from "./proposal";
import { doInSpan } from "@/app/lib/logging";
import {
  findProposal,
  findProposalType,
  findProposalsQueryFromDB,
  getProposalsCount,
} from "@/lib/prismaUtils";
import { Block } from "ethers";
import { withMetrics } from "@/lib/metricWrapper";
import { unstable_cache } from "next/cache";
import { getPublicClient } from "@/lib/viem";
import {
  getProposalTypesFromDaoNode,
  getProposalsFromDaoNode,
} from "@/app/lib/dao-node/client";


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
          async () => {
            const useDaoNode =
              ui.toggle("use-daonode-for-proposals")?.enabled ?? false;

            let proposalsResult;

            if (useDaoNode) {
              proposalsResult = await paginateResult(
                async (skip: number, take: number) => {
                  try {
                    const result = await getProposalsFromDaoNode(
                      skip,
                      take,
                      filter
                    );

                    return (result as unknown) as ProposalPayload[];
                  } catch (error) {
                    console.warn("REST API failed, falling back to DB:", error);
                  }

                  const result = await findProposalsQueryFromDB({
                    namespace,
                    skip,
                    take,
                    filter,
                    contract: contracts.governor.address,
                  });

                  return result as ProposalPayload[];
                },
                pagination
              );
            } else {
              proposalsResult = await paginateResult(
                async (skip: number, take: number) => {
                  const result = await findProposalsQueryFromDB({
                    namespace,
                    skip,
                    take,
                    filter,
                    contract: contracts.governor.address,
                  });

                  return result as ProposalPayload[];
                },
                pagination
              );
            }

            return proposalsResult as PaginatedResult<ProposalPayload[]>;
          }
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

    const isTimeStampBasedTenant = ui.toggle(
      "use-timestamp-for-proposals"
    )?.enabled;

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
      (isTimeStampBasedTenant
        ? !isTimestampBasedProposal(proposal) ||
          Number(getStartTimestamp(proposal)) > latestBlock.timestamp
        : Number(getStartBlock(proposal)) > latestBlock.number) || !latestBlock;

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

    const configuratorContract = contracts.proposalTypesConfigurator;

    if (!configuratorContract) {
      return [];
    }

    let types = [];

    const typesFromApi = await getProposalTypesFromDaoNode();

    if (typesFromApi) {
      const parsedTypes = Object.entries(typesFromApi.proposal_types)?.map(
        ([proposalTypeId, type]: any) => ({
          ...type,
          proposal_type_id: String(proposalTypeId),
          quorum: Number(type.quorum),
          approval_threshold: Number(type.approval_threshold),
          isClientSide: false,
          module: type.module,
        })
      );
      types = parsedTypes;
    } else {
      types = await findProposalType({
        namespace,
        contract: configuratorContract.address,
      });
    }

    if (!contracts.supportScopes) {
      const formattedTypes = types.map((type) => {
        return {
          ...type,
          proposal_type_id: String(type.proposal_type_id),
          quorum: Number(type.quorum),
          approval_threshold: Number(type.approval_threshold),
          isClientSide: false,
          module: type.module,
          scopes: [],
        };
      });
      return formattedTypes;
    }

    const formattedTypes = await Promise.all(
      types.map(async (type) => {
        const scopes =
          typesFromApi?.proposal_types?.[type.proposal_type_id]?.scopes;
        const formattedScopes: {
          proposal_type_id: string;
          scope_key: string;
          selector: string;
          description: string;
          disabled_event: string;
          deleted_event: string;
          status: string;
        }[] = scopes
          ? scopes
              .filter((scope: any) => scope.status === "created")
              .reduce((unique: any[], scope: any) => {
                if (!unique.find((s) => s.scope_key === scope.scope_key)) {
                  unique.push({
                    proposal_type_id: type.proposal_type_id,
                    scope_key: scope.scope_key,
                    selector: scope.selector,
                    description: scope.description,
                    disabled_event: scope.disabled_event,
                    deleted_event: scope.deleted_event,
                    status: scope.status,
                  });
                }
                return unique;
              }, [])
          : [];

        const enriched = await Promise.all(
          formattedScopes?.map(async (scope) => {
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

            if (!scopes.length) {
              return {
                ...scope,
                parameters: [],
                comparators: [],
                types: [],
                exists: false,
              };
            }

            return scopes.map((scope) => ({
              ...scope,
              scope_key: scope.key,
              parameters: scope.parameters || [],
              comparators: scope.comparators || [],
              types: scope.types || [],
              exists: scope.exists || false,
            }));
          })
        );

        return {
          name: type.name,
          proposal_type_id: String(type.proposal_type_id),
          quorum: Number(type.quorum),
          approval_threshold: Number(type.approval_threshold),
          isClientSide: false,
          module: type.module,
          scopes: enriched?.flat(),
        };
      })
    );

    return formattedTypes;
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
export const fetchProposalUnstableCache = unstable_cache(getProposal, [], {
  tags: ["proposal"],
  revalidate: 3600, // 1 hour
});
