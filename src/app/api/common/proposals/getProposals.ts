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
    const response = await fetch(`${process.env.DAONODE_API_URL}/proposals`)
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    return {
      data: result.data
    };
  } catch (error) {
    console.error('Failed to fetch from REST API:', error);
    throw error;
  }




  /* 
  CURRENT REPONSE:

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
      "description": "# Add 1 Basis Point Fee Tier  ## TLDR: Uniswap should add a 1bps fee tier with 1 tick spacing. This change is straightforward from a technical perspective and would help Uniswap compete in stablecoin <> stablecoin pairs, where the majority of the market share is taken by Curve and DODO.  ## Background on pool fees Uniswap v3 allows for the creation of new pools via calls to the [factory contract](https://etherscan.io/address/0x1F98431c8aD98523631AE4a59f267346ea31F984). In order to keep liquidity for pairs consolidated, only a few fee options are allowed–currently, 5, 30, and 100 basis points are supported (10, 60, 200 tick spacing).  Governance should add a 1 basis point fee option for the following reasons: * Curve’s stablecoin markets have 3-4 bps fees. * Dodo’s stablecoin markets have a 1 bps fee. * FTX’s fees for retail are 2/7bps fees and for whales 0/4bps.  However, we recognize there are some potential counterarguments to adding this fee tier: * Adding too many fee tiers can fragment liquidity. * Liquidity providers may earn less in fees.  ### We discuss each of these points in greater detail below This will allow for the creation of much more competitive stablecoin<>stablecoin pools.  Offering low slippage on stablecoin<>stablecoin pairs in AMMs is generally easier than other pairs due to their relatively low price volatility.  As such, the determining factor in driving volume is trading fees. Pouring more capital into a 5 bps fee pool won’t necessarily make Uniswap v3’s pricing more attractive, as lower cost pools exist such as [Curve’s 3pool](https://curve.fi/3pool) (3 bps fees) and [DODO’s USDC-USDT](https://app.dodoex.io/liquidity?network=mainnet) pool (1 bps fees). Indeed, [most USDC-USDT volume from 1inch is routed to DODO](https://dune.xyz/queries/135498). Very little of it is routed to Uniswap v3.  [In the DEX market as a whole](https://dune.xyz/queries/150801) (not just 1inch), DODO and Curve still take the majority of the market share (60-70%) in USDC-USDT trading. Uniswap v3’s concentrated liquidity helped increase market share, but lower fees can help it grab more.  The data tells a similar story for DAI-USDC (see [1inch exported volume](https://dune.xyz/queries/152001) and [overall market share](https://dune.xyz/queries/151999)), though in the case of DAI-USDC, DODO is less active. While the case is compelling just from competition in the DEX space, Uniswap also competes with centralized exchanges.  Many centralized exchanges offer lower than 5 basis point taker fees for high volume traders ([Binance](https://www.binance.com/en/fee/schedule) offers < 5 basis point fees above 40K BTC in 30-day volume, [FTX](https://help.ftx.com/hc/en-us/articles/360024479432-Fees) above $25M in 30-day volume, etc.). Lower fees could increase the DEX volume pie by comparing favorably to spot markets on centralized exchanges and drawing volume from large players. ### The change is a very light touch. The change requires just one function call–[`enableFeeAmount(100)`](https://github.com/Uniswap/v3-core/blob/b2c5555d696428c40c4b236069b3528b2317f3c1/contracts/interfaces/IUniswapV3Factory.sol#L77)–on the factory contract. Governance controls this contract, so a simple proposal could make this change.  The enableFeeAmount function takes as parameters  1. Fee: the fee amount denominated in 100ths of a basis point. 2. `tickSpacing`: the granularity one may specify a liquidity range (see the Uniswap v3 Core [whitepaper](https://uniswap.org/whitepaper-v3.pdf) for more details)  To add a 1 basis point fee option, fee would be 100.  `tickSpacing` requires some consideration. On the one hand, too high of a value restricts LPs’ ability to set granular prices, since initializable price ticks would be roughly [`tickSpacing`] basis points apart. On the other hand, too low of a value could entail liquidity being too low in each tick, meaning that larger orders may need to cross multiple ticks to fill, entailing extra gas cost for each additional tick.  We suggest that a value of 1 for `tickSpacing` would be reasonable for 1 basis point fee pools, allowing LPs to set prices with precision in positions that span ~1 basis point between initializable ticks.  For a stablecoin market like USDC-USDT, we expect most of the liquidity to reside in 6 ticks. Orders <$1m will like only require 1 tick and larger orders may require a second or third tick. For each tick used it adds about 15k-20k gas costs.  ### Too many fee tiers can fragment liquidity  The downside of adding too many fee tier possibilities is that liquidity is then fragmented across pools. However, we believe that LPs will naturally settle over time into the fee tier that is most appropriate for the volatility of the pair.  Pairs with particularly low volatility, like stablecoin<>stablecoin pairs, will likely have a liquidity migration to the 1 bps tier, as the required return to capital should be low in equilibrium given the low risk of impermanent loss.  ### LPs may earn less in fees  Assuming overall volume stays stable (although it’s worth mentioning more competitive fees should grow the pie), total fees paid will go down (volume would have to 5X for fees paid to LPs to stay the same).  However, LPs are not the only constituency to take into consideration–takers will be paying lower fees in aggregate. Growing Uniswap’s market share and being the best place to trade across many pairs is important. These pools could become more enticing to large traders looking to swap stablecoins, for instance.  ## Concluding Thoughts  We believe this simple change could boost Uniswap’s competitiveness in low volatility pairs, and the change presents minimal risk for Uniswap.",
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

  FORMATTED RESPONSE:

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
    const useRestApi = false; //ui.toggle("use-daonode-for-proposals")?.enabled ?? false;
    
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

    for (const proposal of proposalsResult.data) {
      console.log(proposal);
    }
    
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
