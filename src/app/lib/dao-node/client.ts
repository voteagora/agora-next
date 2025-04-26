import Tenant from "@/lib/tenant/tenant";
import { cache } from "react";

const { contracts, namespace } = Tenant.current();

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


export const getAllProposalsFromDaoNode = async (
  filter : string
) => {

  const url = getDaoNodeURLForNamespace(namespace);

  try {
    const response = await fetch(
      `${url}v1/proposals` //?set=${filter}`
    );

    const startTime = Date.now();

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status} (${url})`);
    }

    const data = await response.json() as {proposals: any[]};

    // Ensure we have an array to work with
    const proposalsArray = Array.isArray(data.proposals) ? data.proposals : [];
    
    const endTime = Date.now();
    
    console.log(`getAllProposalsFromDaoNode took ${endTime - startTime}ms`);
    
    return proposalsArray;

  } catch (error) {
    console.error("Failed to fetch from DAO Node API:", error);
    throw error;
  }
}

export const getCachedAllProposalsFromDaoNode = cache(getAllProposalsFromDaoNode);

export const getProposalsFromDaoNode = async (skip: number, take: number, filter: string) => {
  console.log(`getProposalsFromDaoNode: skip=${skip}, take=${take}, filter=${filter}`);
  const out = (await getCachedAllProposalsFromDaoNode(filter))

  console.log("out", out.length);
  
  return out.slice(skip, skip + take);
} 

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
