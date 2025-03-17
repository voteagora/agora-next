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
  findProposalsQueryFromDB,
  getProposalsCount,
} from "@/lib/prismaUtils";
import { Block } from "ethers";
import { unstable_cache } from "next/cache";
import Decimal from 'decimal.js';

interface DAONodeAPIResponse {
  block_number: number;
  transaction_index: number;
  log_index: number;
  id: string;
  proposer: string;
  targets: string[];
  values: number[];
  signatures: string[];
  calldatas: string[];
  start_block: number;
  end_block: number;
  description: string;
  queue_event?: {
    block_number: number;
    transaction_index: number;
    log_index: number;
    id: string;
    eta: number;
  };
  execute_event?: {
    block_number: number;
    transaction_index: number;
    log_index: number;
    id: string;
  };
  proposal_results: Record<string, string>;
}

function adaptDAONodeResponse(apiResponse: DAONodeAPIResponse): ProposalPayload {
  return {
    proposal_id: apiResponse.id,
    contract: process.env.DAONODE_CONTRACT_ADDRESS ?? '',
    proposer: apiResponse.proposer.toLowerCase(),
    description: apiResponse.description,
    ordinal: new Decimal(apiResponse.block_number),
    created_block: BigInt(apiResponse.block_number),
    start_block: apiResponse.start_block.toString(),
    end_block: apiResponse.end_block.toString(),
    cancelled_block: null,
    executed_block: apiResponse.execute_event ? BigInt(apiResponse.execute_event.block_number) : null,
    queued_block: apiResponse.queue_event ? BigInt(apiResponse.queue_event.block_number) : null,
    proposal_data: {
      values: apiResponse.values,
      targets: apiResponse.targets,
      calldatas: apiResponse.calldatas,
      signatures: apiResponse.signatures
    },
    proposal_data_raw: JSON.stringify({
      values: apiResponse.values,
      targets: apiResponse.targets,
      calldatas: apiResponse.calldatas,
      signatures: apiResponse.signatures
    }),
    proposal_type: 'STANDARD',
    proposal_type_data: null,
    proposal_results: {
      standard: Object.entries(apiResponse.proposal_results).reduce((acc, [key, value]) => {
        acc[key] = Number(value);
        return acc;
      }, {} as Record<string, number>)
    },
    created_transaction_hash: null,
    cancelled_transaction_hash: null,
    queued_transaction_hash: null,
    executed_transaction_hash: null
  };
}

async function fetchProposalsFromDAONodeApi({
  namespace,
  skip,
  take,
  filter
}: {
  namespace: string;
  skip: number;
  take: number;
  filter: string;
}): Promise<{ data: ProposalPayload[] }> {
  try {
    const response = await fetch(`${process.env.DAONODE_API_URL}/proposals?set=relevant`)
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    const adaptedData = result.proposals.map(adaptDAONodeResponse);
    return {
      data: adaptedData
    };
  } catch (error) {
    console.error('Failed to fetch from REST API:', error);
    throw error;
  }




  /* 
  CURRENT DAO NODE REPONSE:

      {
      "block_number": 13538153,
      "transaction_index": 376,
      "log_index": 606,
      "id": "9",
      "proposer": "0x9b68c14e936104e9a7a24c712beecdc220002984",
      "targets": [
        "0x1f98431c8ad98523631ae4a59f267346ea31f984"
      ],
      "values": [
        0
      ],
      "signatures": [
        "enableFeeAmount(uint24,int24)"
      ],
      "calldatas": [
        "00000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000001"
      ],
      "start_block": 13551293,
      "end_block": 13591613,
      "description": "# Add 1 Basis P...",
      "queue_event": {
        "block_number": 13591709,
        "transaction_index": 311,
        "log_index": 539,
        "id": "9",
        "eta": 1636763195
      },
      "execute_event": {
        "block_number": 13604706,
        "transaction_index": 244,
        "log_index": 354,
        "id": "9"
      },
      "proposal_results": {
        "1": "71369769192668307336680735"
      }
    }

   DB RECORD RESPONSE:

  /*{
    proposal_id: '62',
    proposer: '0xecc2a9240268bc7a26386ecb49e1befca2706ac9',
    description: '# Mobilizing the Uniswap Treasury\n' +
      'The UTWG will also try to collaborate with those working on various legal developments including the recent [<u>Wyoming Decentralized Unincorporated Nonprofit Association (DUNA) Act</u>](https://a16zcrypto.com/posts/article/duna-for-daos/). This process may fall outside of the jurisdiction of the treasury committee and may require outsourcing entirely to another party. It’s vital that this treasury research is analyzed in the context of potential legal structures, and we won’t move forward with implementing our research unless there are proper legal frameworks in place. The Uniswap DAO has yet t'... 5635 more characters,
    created_block: 19748314n,
    start_block: '19761454',
    end_block: '19801774',
    cancelled_block: null,
    executed_block: 19816075n,
    queued_block: 19801776n,
    proposal_data: {
      values: [ 0 ],
      targets: [ '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' ],
      calldatas: [
        '0xa9059cbb0000000000000000000000003b59c6d0034490093460787566dc5d6ce17f2f9c00000000000000000000000000000000000000000000014542ba12a337c00000'
      ],
      signatures: [ '' ]
    },
    proposal_results: {
      standard: {
        '0': 4.6242347731945804e+22,
        '1': 4.20659862829919e+25,
        '2': 304963417219416640
      },
      approval: null
    },
    proposal_type: 'STANDARD'
  }
  */

}

async function getProposals({
  filter,
  pagination,
}: {
  filter: string;
  pagination: PaginationParams;
}): Promise<PaginatedResult<Proposal[]>> {
  const { namespace, contracts, ui } = Tenant.current();

  const getProposalsExecution = doInSpan({ name: "getProposals" }, async () => {
    const useRestApi = ui.toggle("use-daonode-for-proposals")?.enabled ?? false;
    
    let proposalsResult;
    if (useRestApi) {
      try {
        proposalsResult = await paginateResult(
          async (skip: number, take: number) => {
            const result = await fetchProposalsFromDAONodeApi({
              namespace,
              skip,
              take,
              filter
            });
            return result.data;
          },
          pagination
        );
      } catch (error) {
        console.warn('REST API failed, falling back to DB:', error);
        proposalsResult = null;
      }
    }
    
    // Fallback to DB or default path if REST API is disabled or failed
    if (!proposalsResult) {
      proposalsResult = await paginateResult(
        (skip: number, take: number) =>
          findProposalsQueryFromDB({
            namespace,
            skip,
            take,
            filter,
            contract: contracts.governor.address,
          }),
        pagination
      );
    }

    // for (const proposal of proposalsResult.data) {
    //  console.log(proposal);
    // }
    
    return proposalsResult;
  });

  const latestBlockPromise: Promise<Block> = ui.toggle("use-l1-block-number")
    ?.enabled
    ? contracts.providerForTime?.getBlock("latest")
    : contracts.token.provider.getBlock("latest");

  const [proposals, latestBlock, votableSupply] = await Promise.all([
    getProposalsExecution,
    latestBlockPromise,
    fetchVotableSupply(),
  ]);

  const resolvedProposals = await Promise.all(
    proposals.data.map(async (proposal: ProposalPayload) => {
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
    })
  );

  return {
    meta: proposals.meta,
    data: resolvedProposals,
  };
}

async function getProposal(proposalId: string) {
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
}

async function getProposalTypes() {
  const { namespace, contracts } = Tenant.current();

  if (!contracts.proposalTypesConfigurator) {
    return [];
  }

  return await findProposalType({
    namespace,
    contract: contracts.proposalTypesConfigurator.address,
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
export const fetchProposalUnstableCache = unstable_cache(getProposal, [], {
  tags: ["proposal"],
  revalidate: 3600, // 1 hour
});
