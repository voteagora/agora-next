import { Block } from "ethers";
import { cache } from "react";
import {
  PaginatedResult,
  paginateResult,
  PaginationParams,
} from "@/app/lib/pagination";
import {
  adaptDAONodeResponse,
  getCachedAllProposalsFromDaoNode,
  getProposalTypesFromDaoNode,
} from "@/app/lib/dao-node/client";
import { doInSpan } from "@/app/lib/logging";
import { Proposal, ProposalPayload } from "@/app/api/common/proposals/proposal";
import { fetchOffchainProposalsMap } from "@/app/api/common/proposals/fetchOffchainProposalsMap";
import { fetchQuorumForProposal } from "@/app/api/common/quorum/getQuorum";
import { fetchVotableSupply } from "@/app/api/common/votableSupply/getVotableSupply";
import { isOffchainLegacyProposalType } from "@/features/proposals/domain";
import {
  findProposalsByIds,
  findProposalsQueryFromDB,
  findSnapshotProposalsQueryFromDb,
} from "@/lib/prismaUtils";
import { parseProposal } from "@/lib/proposalUtils";
import {
  getLatestBlockPromise,
  getOffchainParentId,
  getProposalTypeValue,
  ProposalRepositoryContext,
} from "./shared";

type GetPaginatedProposalsDataInput = ProposalRepositoryContext & {
  filter: string;
  pagination: PaginationParams;
  type?: string;
};

const fetchSnapshotProposalsFromDB = cache(
  async (namespace: ProposalRepositoryContext["namespace"], contract: string) =>
    findSnapshotProposalsQueryFromDb({
      namespace,
      contract,
    })
);

async function fetchProposalsFromDaoNode(
  skip: number,
  take: number,
  filter: string,
  useSnapshot: boolean,
  { namespace, contracts }: ProposalRepositoryContext
): Promise<ProposalPayload[]> {
  try {
    const [data, typesFromApi] = await Promise.all([
      getCachedAllProposalsFromDaoNode(),
      getProposalTypesFromDaoNode(),
    ]);

    let proposals = data;

    if (filter === "relevant") {
      proposals = proposals.filter((proposal) => !proposal.cancel_event);
    }

    proposals = proposals.map((proposal) =>
      adaptDAONodeResponse(proposal, typesFromApi.proposal_types)
    );

    if (useSnapshot) {
      const snapshotData = await fetchSnapshotProposalsFromDB(
        namespace,
        contracts.governor.address
      );
      proposals = [...proposals, ...snapshotData];
      proposals.sort((a, b) => b.start_block - a.start_block);
    }

    return proposals.slice(skip, skip + take) as ProposalPayload[];
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

function extractOnchainIdsFromOffchainProposals(
  proposals: ProposalPayload[]
): string[] {
  return proposals
    .filter((proposal) => {
      const proposalType = getProposalTypeValue(proposal);
      return (
        !!proposalType &&
        isOffchainLegacyProposalType(proposalType) &&
        !!getOffchainParentId(proposal)
      );
    })
    .map((proposal) => getOffchainParentId(proposal))
    .filter((proposalId): proposalId is string => !!proposalId);
}

async function fetchOnchainProposalsByIds(
  proposalIds: string[],
  { namespace, contracts }: ProposalRepositoryContext
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

    for (const proposal of onchainProposals) {
      onchainProposalsMap.set(
        proposal.proposal_id,
        proposal as ProposalPayload
      );
    }
  } catch (error) {
    console.error("Failed to fetch onchain proposals:", error);
  }

  return onchainProposalsMap;
}

function getOnchainProposalIds(proposals: ProposalPayload[]): string[] {
  return proposals
    .filter((proposal) => {
      const proposalType = getProposalTypeValue(proposal);
      return !!proposalType && !isOffchainLegacyProposalType(proposalType);
    })
    .map((proposal) => proposal.proposal_id);
}

function shouldSkipProposal(
  proposal: ProposalPayload,
  filter: string,
  type?: string
): boolean {
  return (
    filter === "relevant" &&
    type !== "OFFCHAIN" &&
    type !== "EXCLUDE_ONCHAIN" &&
    !!getOffchainParentId(proposal)
  );
}

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

  const proposalType = getProposalTypeValue(proposal);
  const onchainId = getOffchainParentId(proposal);

  if (proposalType && isOffchainLegacyProposalType(proposalType) && onchainId) {
    const onchainProposal = onchainProposalsMap.get(onchainId);
    if (onchainProposal) {
      baseProposal = onchainProposal;
      offchainProposal = proposal;
    }
  }

  return { baseProposal, offchainProposal };
}

async function fetchInitialProposals(
  pagination: PaginationParams,
  filter: string,
  type: string | undefined,
  useDaoNode: boolean,
  useSnapshot: boolean,
  context: ProposalRepositoryContext
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
            context
          );
        }

        return (await findProposalsQueryFromDB({
          namespace: context.namespace,
          skip,
          take,
          filter,
          type,
          contract: context.contracts.governor.address,
        })) as ProposalPayload[];
      },
      pagination
    );

    return proposalsResult as PaginatedResult<ProposalPayload[]>;
  });
}

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

  const uniqueProposals: Proposal[] = [];
  const seenProposalIds = new Set<string>();

  resolvedProposals.forEach((proposal) => {
    if (!proposal || seenProposalIds.has(proposal.id)) {
      return;
    }

    seenProposalIds.add(proposal.id);
    uniqueProposals.push(proposal);
  });

  return uniqueProposals;
}

export async function getPaginatedProposalsData({
  filter,
  pagination,
  type,
  namespace,
  contracts,
  ui,
}: GetPaginatedProposalsDataInput): Promise<PaginatedResult<Proposal[]>> {
  const useDaoNode = ui.toggle("use-daonode-for-proposals")?.enabled ?? false;
  const useSnapshot = ui.toggle("snapshotVotes")?.enabled ?? false;
  const context = { namespace, contracts, ui };

  const [proposals, latestBlock, votableSupply] = await Promise.all([
    fetchInitialProposals(
      pagination,
      filter,
      type,
      useDaoNode,
      useSnapshot,
      context
    ),
    getLatestBlockPromise(ui, contracts),
    fetchVotableSupply(),
  ]);

  const referencedOnchainIds = extractOnchainIdsFromOffchainProposals(
    proposals.data
  );
  const onchainProposalIds = getOnchainProposalIds(proposals.data);

  const [onchainProposalsMap, offchainProposalsMap] = await Promise.all([
    fetchOnchainProposalsByIds(referencedOnchainIds, context),
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
}
