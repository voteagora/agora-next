import {
  ProposalPayloadFromDAONode,
  ProposalPayloadFromDB,
} from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { cache } from "react";
import { ProposalType } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { DaoNodeVote } from "@/app/api/common/votes/vote";

const { contracts, namespace } = Tenant.current();

export function adaptDAONodeResponse(
  apiResponse: ProposalPayloadFromDAONode
): ProposalPayloadFromDB {
  const votingModuleName = apiResponse.voting_module_name;

  let proposalResults;
  let proposalData;

  if (votingModuleName == "standard") {
    proposalData = {
      values: apiResponse.values,
      targets: apiResponse.targets,
      signatures: apiResponse.signatures,
      calldatas: apiResponse.calldatas.map((c) => "0x" + c),
    };

    proposalResults = {
      standard: {
        "0": BigInt(apiResponse.totals["no-param"]?.["0"] ?? "0"),
        "1": BigInt(apiResponse.totals["no-param"]?.["1"] ?? "0"),
        "2": BigInt(apiResponse.totals["no-param"]?.["2"] ?? "0"),
      },
      approval: null,
    };
  } else if (votingModuleName == "approval") {
    proposalData = apiResponse.decoded_proposal_data;

    const approvalVotes = Object.entries(apiResponse.totals)
      .filter(([key]) => key !== "no-param")
      .map(([param, votes]) => ({
        param,
        votes: BigInt(votes["1"] ?? "0"),
      }));

    proposalResults = {
      approval: approvalVotes,
      standard: {
        "0": BigInt(apiResponse.totals["no-param"]?.["0"] ?? "0"),
        "1": approvalVotes.reduce((sum, vote) => sum + vote.votes, BigInt(0)),
        "2": BigInt(apiResponse.totals["no-param"]?.["2"] ?? "0"),
      },
    };
  } else if (votingModuleName == "optimistic") {
    proposalData = apiResponse.decoded_proposal_data;

    proposalResults = {
      standard: {
        "0": BigInt(apiResponse.totals["no-param"]?.["0"] ?? "0"),
      },
      approval: null,
    };
  } else {
    throw new Error(`Unknown voting module name: ${votingModuleName}`);
  }

  return {
    proposal_id: apiResponse.id,
    proposer: apiResponse.proposer.toLowerCase(),
    description: apiResponse.description,
    created_block: BigInt(apiResponse.block_number),
    start_block: apiResponse.start_block.toString(),
    end_block: apiResponse.end_block.toString(),
    cancelled_block: apiResponse.cancel_event
      ? BigInt(apiResponse.cancel_event.block_number)
      : null,
    executed_block: apiResponse.execute_event
      ? BigInt(apiResponse.execute_event.block_number)
      : null,
    queued_block: apiResponse.queue_event
      ? BigInt(apiResponse.queue_event.block_number)
      : null,
    proposal_data: proposalData,
    proposal_type: apiResponse.voting_module_name.toUpperCase() as ProposalType,
    proposal_type_data: null,
    proposal_results: proposalResults,

    proposal_data_raw: apiResponse.proposal_data,

    created_transaction_hash: null,
    cancelled_transaction_hash: null,
    queued_transaction_hash: null,
    executed_transaction_hash: null,
  };
}

export const getDaoNodeURLForNamespace = (namespace: string) => {
  const url = process.env.DAONODE_URL_TEMPLATE;
  let parsedUrl = url?.replace("{TENANT_NAMESPACE}", namespace);
  if (parsedUrl && !parsedUrl.endsWith("/")) {
    parsedUrl = `${parsedUrl}/`;
  }

  return parsedUrl;
};

export const getProposalTypesFromDaoNode = async () => {
  const url = getDaoNodeURLForNamespace(namespace);
  const supportScopes = contracts.supportScopes;
  if (!url || !supportScopes) {
    return null;
  }

  const response = await fetch(`${url}v1/proposal_types`);
  const data = await response.json();

  return data;
};

export const getAllProposalsFromDaoNode = async () => {
  const url = getDaoNodeURLForNamespace(namespace);

  try {
    const startTime = Date.now();

    const startTimeS = new Date(startTime).toLocaleString();

    console.log(`${startTimeS} -> getAllProposalsFromDaoNode`);

    const response = await fetch(
      `${url}v1/proposals?set=everything` //?set=${filter}`
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status} (${url})`);
    }

    const data = (await response.json()) as { proposals: any[] };

    const proposalsArray = Array.isArray(data.proposals) ? data.proposals : [];

    const endTime = Date.now();
    const endTimeS = new Date(endTime).toLocaleString();

    // Optimization: We shouldnt need to sort here
    // DAO Node should be able to do this for us.
    // We'll handle this once/if we add
    // Snapshot to either DAO Node or Agora-Next
    const sortedProposalsArray = proposalsArray.sort((a, b) => {
      return b.start_block - a.start_block;
    });

    console.log(
      `${endTimeS} <- getAllProposalsFromDaoNode took ${endTime - startTime}ms`
    );

    return sortedProposalsArray;
  } catch (error) {
    console.error("Failed to fetch from DAO Node API:", error);
    throw error;
  }
};

export const getVotableSupplyFromDaoNode = async () => {
  const url = getDaoNodeURLForNamespace(namespace);

  try {
    const startTime = Date.now();

    const response = await fetch(`${url}v1/voting_power`);

    const startTimeS = new Date(startTime).toLocaleString();

    console.log(`${startTimeS} -> getVotableSupplyFromDaoNode`);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status} (${url})`);
    }

    const data = (await response.json()) as { voting_power: string };

    const votableSupply = data.voting_power;

    const endTime = Date.now();
    const endTimeS = new Date(endTime).toLocaleString();

    console.log(
      `${endTimeS} <- getVotableSupplyFromDaoNode took ${endTime - startTime}ms`
    );

    return votableSupply;
  } catch (error) {
    console.error("Failed to fetch from DAO Node API:", error);
    throw error;
  }
};

export const getCachedAllProposalsFromDaoNode = cache(
  getAllProposalsFromDaoNode
); 

export const getProposalsFromDaoNode = async (
  skip: number,
  take: number,
  filter: string
): Promise<ProposalPayloadFromDAONode[]> => {
  let data = await getCachedAllProposalsFromDaoNode();

  if (filter == "relevant") {
    data = data.filter((proposal) => {
      return !proposal.cancel_event;
    });
  }

  // const has_next: boolean = data.length > skip + take;
  // const total_returned: number = data.length;
  // const next_offset: number = skip + take;

  // this takes 0ms for Uniswap.  It's gross, but
  // not slow.
  data = data.slice(skip, skip + take);

  data = data.map(adaptDAONodeResponse);

  return data;
};

/* 

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

export const getProposalFromDaoNode = unstable_cache(
  async (proposalId: string) => {
    const url = getDaoNodeURLForNamespace(namespace);
    const response = await fetch(`${url}v1/proposal/${proposalId}`);
    const data: {
      proposal: ProposalPayloadFromDAONode;
    } = await response.json();
    return data;
  },
  ["proposalFromDaoNode"],
  {
    tags: ["proposalFromDaoNode"],
    revalidate: 60, // 1 minute
  }
);

export const getVotingHistoryFromDaoNode = async (address: string) => {
  const url = getDaoNodeURLForNamespace(namespace);
  const response = await fetch(`${url}v1/delegate/${address}/voting_history`);
  const data: { voting_history: DaoNodeVote[] } = await response.json();
  return data;
};
