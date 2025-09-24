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
import { ProposalStage as PrismaProposalStage } from "@prisma/client";
import { Proposal, ProposalPayload } from "./proposal";
import { doInSpan } from "@/app/lib/logging";
import {
  findOffchainProposal,
  findProposal,
  findProposalsByIds,
  findProposalType,
  findProposalsQueryFromDB,
  findSnapshotProposalsQueryFromDb,
  getProposalsCount,
} from "@/lib/prismaUtils";
import { fetchOffchainProposalsMap } from "./fetchOffchainProposalsMap";
import { Block } from "ethers";

import { withMetrics } from "@/lib/metricWrapper";
import { unstable_cache } from "next/cache";
import { getPublicClient } from "@/lib/viem";
import {
  adaptDAONodeResponse,
  getCachedAllProposalsFromDaoNode,
  getProposalTypesFromDaoNode,
} from "@/app/lib/dao-node/client";

// Helper function to fetch proposals from DAO Node
async function fetchProposalsFromDaoNode(
  skip: number,
  take: number,
  filter: string,
  useSnapshot: boolean,
  namespace: any,
  contracts: any
): Promise<ProposalPayload[]> {
  try {
    const [data, typesFromApi] = await Promise.all([
      getCachedAllProposalsFromDaoNode(),
      getProposalTypesFromDaoNode(),
    ]);

    let proposals = data;

    // Apply relevant filter
    if (filter === "relevant") {
      proposals = proposals.filter((proposal) => !proposal.cancel_event);
    }

    // Adapt DAO Node response format
    proposals = proposals.map((proposal) =>
      adaptDAONodeResponse(proposal, typesFromApi.proposal_types)
    );

    // Include snapshot proposals if enabled
    if (useSnapshot) {
      const snapshotData = await fetchSnapshotProposalsFromDB();
      proposals = [...proposals, ...snapshotData];

      // Sort by start block descending
      proposals.sort((a, b) => b.start_block - a.start_block);
    }

    return proposals.slice(skip, skip + take) as unknown as ProposalPayload[];
  } catch (error) {
    console.warn("REST API failed, falling back to DB:", error);
    return (await findProposalsQueryFromDB({
      namespace,
      skip,
      take,
      filter,
      contract: contracts.governor.address,
    })) as ProposalPayload[];
  }
}

// Helper function to extract onchain IDs from offchain proposals
function extractOnchainIdsFromOffchainProposals(
  proposals: ProposalPayload[]
): string[] {
  return proposals
    .filter(
      (proposal) =>
        proposal.proposal_type?.startsWith("OFFCHAIN") &&
        (proposal.proposal_data as any)?.onchain_proposalid
    )
    .map((proposal) => (proposal.proposal_data as any).onchain_proposalid);
}

// Helper function to fetch onchain proposals by IDs
async function fetchOnchainProposalsByIds(
  proposalIds: string[],
  namespace: any,
  contracts: any
): Promise<Map<string, ProposalPayload>> {
  const onchainProposalsMap = new Map<string, ProposalPayload>();

  if (proposalIds.length === 0) {
    return onchainProposalsMap;
  }

  try {
    const onchainProposals = await findProposalsByIds({
      namespace,
      proposalIds,
      contract: contracts.governor.address,
    });

    onchainProposals.forEach((proposal) => {
      if (proposal) {
        onchainProposalsMap.set(
          proposal.proposal_id,
          proposal as ProposalPayload
        );
      }
    });
  } catch (error) {
    console.error(`Failed to fetch onchain proposals:`, error);
  }

  return onchainProposalsMap;
}

// Helper function to get non-offchain proposal IDs
function getOnchainProposalIds(proposals: ProposalPayload[]): string[] {
  return proposals
    .filter(
      (proposal) =>
        proposal.proposal_type && !proposal.proposal_type.startsWith("OFFCHAIN")
    )
    .map((proposal) => proposal.proposal_id);
}

// Helper function to determine if a proposal should be skipped
function shouldSkipProposal(
  proposal: ProposalPayload,
  filter: string,
  type?: string
): boolean {
  return (
    filter === "relevant" &&
    type !== "OFFCHAIN" &&
    type !== "EXCLUDE_ONCHAIN" &&
    !!(proposal.proposal_data as any)?.onchain_proposalid
  );
}

// Helper function to determine base and offchain proposals for hybrid proposals
function resolveHybridProposal(
  proposal: ProposalPayload,
  onchainProposalsMap: Map<string, ProposalPayload>,
  offchainProposalsMap: Map<string, ProposalPayload | null>
): {
  baseProposal: ProposalPayload;
  offchainProposal: ProposalPayload | null;
} {
  let baseProposal = proposal;
  let offchainProposal = offchainProposalsMap.get(proposal.proposal_id) || null;

  if (
    proposal.proposal_type?.startsWith("OFFCHAIN") &&
    (proposal.proposal_data as any)?.onchain_proposalid
  ) {
    const onchainId = (proposal.proposal_data as any).onchain_proposalid;
    const onchainProposal = onchainProposalsMap.get(onchainId);
    if (onchainProposal) {
      baseProposal = onchainProposal;
      offchainProposal = proposal;
    }
  }

  return { baseProposal, offchainProposal };
}

// Main function to fetch initial proposals
async function fetchInitialProposals(
  pagination: PaginationParams,
  filter: string,
  type: string | undefined,
  useDaoNode: boolean,
  useSnapshot: boolean,
  namespace: any,
  contracts: any
): Promise<PaginatedResult<ProposalPayload[]>> {
  return doInSpan({ name: "getProposals" }, async () => {
    const proposalsResult = await paginateResult(
      async (skip: number, take: number) => {
        if (useDaoNode) {
          return await fetchProposalsFromDaoNode(
            skip,
            take,
            filter,
            useSnapshot,
            namespace,
            contracts
          );
        }
        return (await findProposalsQueryFromDB({
          namespace,
          skip,
          take,
          filter,
          type,
          contract: contracts.governor.address,
        })) as ProposalPayload[];
      },
      pagination
    );
    return proposalsResult as PaginatedResult<ProposalPayload[]>;
  });
}

// Function to get latest block
function getLatestBlockPromise(ui: any, contracts: any): Promise<Block> {
  return ui.toggle("use-l1-block-number")?.enabled
    ? contracts.providerForTime?.getBlock("latest")
    : contracts.token.provider.getBlock("latest");
}

// Function to process and parse proposals
async function processAndParseProposals(
  proposals: ProposalPayload[],
  onchainProposalsMap: Map<string, ProposalPayload>,
  offchainProposalsMap: Map<string, ProposalPayload | null>,
  latestBlock: Block,
  votableSupply: string,
  filter: string,
  type?: string
): Promise<Proposal[]> {
  const resolvedProposals = await Promise.all(
    proposals.map(async (proposal) => {
      if (shouldSkipProposal(proposal, filter, type)) {
        return null;
      }

      const { baseProposal, offchainProposal } = resolveHybridProposal(
        proposal,
        onchainProposalsMap,
        offchainProposalsMap
      );

      const quorum = await fetchQuorumForProposal(baseProposal);

      return parseProposal(
        baseProposal,
        latestBlock,
        quorum ?? null,
        BigInt(votableSupply),
        offchainProposal as ProposalPayload
      );
    })
  );

  return resolvedProposals.filter((p) => p !== null) as Proposal[];
}

// Is this working? Not sure, but i don't think so.
// TODO: Check before enabling DAO-NODE PROPOSALS
function getSnapshotProposalsFromDB() {
  const { namespace, contracts } = Tenant.current();

  return findSnapshotProposalsQueryFromDb({
    namespace,
    contract: contracts.governor.address,
  });
}

const fetchSnapshotProposalsFromDB = cache(getSnapshotProposalsFromDB);

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
        const useDaoNode =
          ui.toggle("use-daonode-for-proposals")?.enabled ?? false;
        const useSnapshot = ui.toggle("snapshotVotes")?.enabled ?? false;

        // Fetch initial proposals and supporting data in parallel
        const [proposals, latestBlock, votableSupply] = await Promise.all([
          fetchInitialProposals(
            pagination,
            filter,
            type,
            useDaoNode,
            useSnapshot,
            namespace,
            contracts
          ),
          getLatestBlockPromise(ui, contracts),
          fetchVotableSupply(),
        ]);

        const referencedOnchainIds = extractOnchainIdsFromOffchainProposals(
          proposals.data
        );
        const onchainProposalIds = getOnchainProposalIds(proposals.data);

        const [onchainProposalsMap, offchainProposalsMap] = await Promise.all([
          // Fetch onchain proposals referenced by offchain proposals (for hybrid proposals)
          // This will get any data of onchain proposals that are in from offchain proposals
          fetchOnchainProposalsByIds(
            referencedOnchainIds,
            namespace,
            contracts
          ),
          // Fetch offchain proposals that correspond to onchain proposals
          // This will get any data of offchain proposals that are in from onchain proposals, we dont have
          // offchainIds here but we will checking with query to get them
          fetchOffchainProposalsMap({
            namespace,
            proposalIds: onchainProposalIds,
          }),
        ]);

        const parsedProposals = await processAndParseProposals(
          proposals.data,
          onchainProposalsMap,
          offchainProposalsMap,
          latestBlock,
          votableSupply,
          filter,
          type
        );

        return {
          meta: proposals.meta,
          data: parsedProposals,
        };
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

    const getOffchainProposal = doInSpan(
      { name: "getOffchainProposal" },
      async () =>
        findOffchainProposal({
          namespace,
          onchainProposalId: proposalId,
        })
    );

    const [proposal, offchainProposal, votableSupply] = await Promise.all([
      getProposalExecution,
      getOffchainProposal,
      fetchVotableSupply(),
    ]);

    if (!proposal) {
      return notFound();
    }

    // Resolve hybrid proposal logic - check if this is an offchain proposal that references an onchain proposal
    let baseProposal = proposal as ProposalPayload;
    let resolvedOffchainProposal = offchainProposal as
      | ProposalPayload
      | undefined;

    // If this is an offchain proposal with an onchain_proposalid, we need to fetch the onchain proposal as the base
    if (
      proposal.proposal_type?.startsWith("OFFCHAIN") &&
      (proposal.proposal_data as any)?.onchain_proposalid
    ) {
      const onchainId = (proposal.proposal_data as any).onchain_proposalid;
      const onchainProposal = await doInSpan(
        { name: "getOnchainProposal" },
        async () =>
          findProposal({
            namespace,
            proposalId: onchainId,
            contract: contracts.governor.address,
          })
      );

      if (onchainProposal) {
        baseProposal = onchainProposal as ProposalPayload;
        resolvedOffchainProposal = proposal as ProposalPayload;
      }
    }

    const latestBlock = await latestBlockPromise;

    const isPending =
      (isTimeStampBasedTenant
        ? !isTimestampBasedProposal(baseProposal) ||
          Number(getStartTimestamp(baseProposal)) > latestBlock.timestamp
        : Number(getStartBlock(baseProposal)) > latestBlock.number) ||
      !latestBlock;

    const quorum = isPending
      ? null
      : await fetchQuorumForProposal(baseProposal);

    return parseProposal(
      baseProposal,
      latestBlock,
      quorum ?? null,
      BigInt(votableSupply),
      resolvedOffchainProposal
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
      const parsedTypes = Object.entries(typesFromApi.proposal_types)
        ?.filter(([proposalTypeId, type]: any) => !!type.name)
        ?.map(([proposalTypeId, type]: any) => ({
          ...type,
          proposal_type_id: String(proposalTypeId),
          quorum: Number(type.quorum),
          approval_threshold: Number(type.approval_threshold),
          isClientSide: false,
          module: type.module,
        }));
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
