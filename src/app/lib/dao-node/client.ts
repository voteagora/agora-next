import {
  ProposalPayloadFromDAONode,
  ProposalPayloadFromDB,
} from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { DelegateResponse, ProposalType } from "@/lib/types";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { fetchDelegateStatements } from "@/app/api/common/delegateStatement/getDelegateStatement";

const { namespace, ui } = Tenant.current();

// DO NOT ENABLE DAO-NODE PROPOSALS UNTIL TODO BELOW IS HANDLED
export function adaptDAONodeResponse(
  apiResponse: ProposalPayloadFromDAONode,
  proposalTypes: any
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

  const proposalType = proposalTypes[String(apiResponse.proposal_type)];
  const parsedProposalType = Object.assign(proposalType, {
    proposal_type_id: String(apiResponse.proposal_type),
  });

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
    // TODO: Add proposal type data
    // DO NOT ENABLE DAO-NODE PROPOSALS UNTIL THIS IS HANDLED
    proposal_type_data: parsedProposalType,
    proposal_results: proposalResults,

    proposal_data_raw: apiResponse.proposal_data,

    created_transaction_hash: null,
    cancelled_transaction_hash: null,
    queued_transaction_hash: null,
    executed_transaction_hash: null,
  };
}

interface MappedDelegate {
  address: string;
  votingPower: {
    total: string;
    direct: string;
    advanced: string;
  };
  statement: {
    address: string;
    payload: {
      delegateStatement: string;
      topIssues: { type: string; value: string }[];
      topStakeholders: { type: string }[];
    };
    endorsed: boolean;
  } | null;
  numOfDelegators: string;
  vpChange7d: string;
  participation: number;
  mostRecentDelegationBlock: number;
  lastVoteBlock: number;
}

export const getDaoNodeURLForNamespace = (namespace: string) => {
  const url = process.env.DAONODE_URL_TEMPLATE;
  let parsedUrl = url?.replace("{TENANT_NAMESPACE}", namespace);
  if (parsedUrl && !parsedUrl.endsWith("/")) {
    parsedUrl = `${parsedUrl}/`;
  }

  return parsedUrl;
};

export const getProposalTypesFromDaoNode = unstable_cache(
  async () => {
    const url = getDaoNodeURLForNamespace(namespace);
    const useDaoNodeForProposalTypes = ui.toggle(
      "use-daonode-for-proposal-types"
    )?.enabled;
    if (!url || !useDaoNodeForProposalTypes) {
      return null;
    }

    const response = await fetch(`${url}v1/proposal_types`);
    const data = await response.json();

    return data;
  },
  ["proposal-types"],
  {
    revalidate: 60, // 1 minute
  }
);

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

export const getDelegatesFromDaoNode = async (options?: {
  sortBy?: string;
  reverse?: boolean;
  limit?: number;
  offset?: number;
  filters?: {
    delegator?: `0x${string}`;
  };
  performInternalPagination?: boolean;
  withParticipation?: boolean;
}) => {
  const url = getDaoNodeURLForNamespace(namespace);

  if (!url) {
    throw new Error("DAO Node URL not found");
  }

  try {
    const sortBy = options?.sortBy || "VP";
    const reverse = options?.reverse ?? true;
    const filters = options?.filters;

    // TODO: Properly cache this... SMH
    // entire point of DAO node is to serve up full state
    // not give tiny little pages.
    // We're setting this at 1000, and gambling that
    // nothing above 1000 will be needed in any given
    // page passed onto the client.

    // if this functions, we can either have DAO-node return a full count
    // and use that intelligence to properly detect when 1000 is insufficient
    // or we can have DAO-node return a "hasMore" boolean or something.

    const queryParams = new URLSearchParams({
      sort_by: sortBy,
      reverse: reverse.toString(),
      include:
        "VP,DC," + (options?.withParticipation ? "PR," : "") + "LVB,MRD,VPC",
      page_size: "1000",
      offset: "0",
    });

    if (filters?.delegator) {
      queryParams.append("delegator", filters.delegator);
    }

    const fullUrl = `${url}v1/delegates?${queryParams}`;

    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch delegates: ${response.status} : ${fullUrl}`
      );
    }

    const data = await response.json();

    if (data && data.delegates && data.delegates.length > 0) {
      const allRawDelegatesFromApi = data.delegates;
      const totalBeforeInternalPagination = allRawDelegatesFromApi.length;

      let delegatesToFetchStatementsFor = [...allRawDelegatesFromApi];

      delegatesToFetchStatementsFor = allRawDelegatesFromApi.slice(0, 1000);

      let mappedDelegates: MappedDelegate[] = [];

      if (delegatesToFetchStatementsFor.length > 0) {
        const delegateAddresses = delegatesToFetchStatementsFor.map(
          (delegate: { addr: string }) => delegate.addr.toLowerCase()
        );

        const statements = await fetchDelegateStatements({
          addresses: delegateAddresses,
        });

        const statementMap: Map<string, any> = new Map();
        statements.forEach((statement) => {
          if (statement) {
            statementMap.set(statement.address.toLowerCase(), statement);
          }
        });

        mappedDelegates = delegatesToFetchStatementsFor.map(
          (delegateFromDaoNode: {
            addr: string;
            VP?: string;
            DC?: number;
            PR?: number;
            VPC?: string;
            MRD?: number;
            LVB?: number;
          }) => {
            const lowerCaseAddress = delegateFromDaoNode.addr.toLowerCase();
            return {
              address: lowerCaseAddress,
              votingPower: {
                total: delegateFromDaoNode.VP || "0",
                direct: delegateFromDaoNode.VP || "0",
                advanced: "0",
              },
              statement: statementMap.get(lowerCaseAddress) || null,
              numOfDelegators: delegateFromDaoNode.DC?.toString() || "0",
              vpChange7d: delegateFromDaoNode.VPC || "0",
              participation: delegateFromDaoNode.PR || 0,
              mostRecentDelegationBlock: delegateFromDaoNode.MRD || 0,
              lastVoteBlock: delegateFromDaoNode.LVB || 0,
            };
          }
        );
      }

      return {
        delegates: mappedDelegates,
        totalBeforeInternalPagination: totalBeforeInternalPagination,
      };
    } else {
      return {
        delegates: [],
        totalBeforeInternalPagination: 0,
      };
    }
  } catch (error) {
    console.error("Error fetching delegates from DAO node:", error);
    return null;
  }
};

/**
 * Fetches participation statistics for a delegate address from the DAO node
 * @param address The delegate address to fetch stats for
 * @returns Participation stats or null if fetching fails
 */
export const getDelegateDataFromDaoNode = async (
  address: string
): Promise<DelegateResponse | null> => {
  const url = getDaoNodeURLForNamespace(namespace);
  if (!url) {
    return null;
  }
  try {
    // Fetch delegate data for participation rate
    const delegateRes = await fetch(`${url}v1/delegate/${address}`);
    // Check if the response was successful
    if (!delegateRes.ok) {
      console.error(
        `Failed to fetch delegate data: ${delegateRes.status} ${delegateRes.statusText}`
      );
      return null;
    }

    return (await delegateRes.json()) as DelegateResponse;
  } catch (error) {
    console.error("Error in getDelegateDataFromDaoNode:", error);
    return null;
  }
};

export const getDelegateVotingPowerFromDaoNode = async (
  address: string
): Promise<string | null> => {
  try {
    const delegateData = await getDelegateDataFromDaoNode(address);
    return delegateData?.delegate?.voting_power ?? null;
  } catch (error) {
    console.error("Failed to load DAO node voting power:", error);
    return null;
  }
};

export const getUserNonIVotesVPAtBlock = async (
  address: string,
  blockNumber: number
): Promise<string | null> => {
  const url = getDaoNodeURLForNamespace(namespace);
  if (!url) {
    return null;
  }
  try {
    const response = await fetch(
      `${url}v1/nonivotes/user/${address}/at-block/${blockNumber}`
    );
    if (!response.ok) {
      console.error(
        `Failed to fetch user non-ivotes vp at block: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = (await response.json()) as {
      address: string;
      block_number: number;
      vp: string;
    };
    return data?.vp ?? null;
  } catch (error) {
    console.error("Error in getUserStakeAtBlock:", error);
    return null;
  }
};
