import { cache } from "react";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import {
  Proposal,
  ProposalPayload,
  ProposalPayloadFromDAONode,
} from "./proposal";
import { parseProposal } from "@/lib/proposalUtils";
import { fetchVotableSupply } from "../votableSupply/getVotableSupply";
import { fetchQuorumForProposal } from "../quorum/getQuorum";
import Tenant from "@/lib/tenant/tenant";
import { Block } from "ethers";
import archivedProposalsData from "@/app/proposals/data/pguild.json";
import {
  adaptDAONodeResponse,
  getProposalTypesFromDaoNode,
} from "@/app/lib/dao-node/client";

// Function to get latest block
function getLatestBlockPromise(ui: any, contracts: any): Promise<Block> {
  return ui.toggle("use-l1-block-number")?.enabled
    ? contracts.providerForTime?.getBlock("latest")
    : contracts.token.provider.getBlock("latest");
}

async function getArchivedProposals({
  filter,
  pagination,
}: {
  filter: string;
  pagination: PaginationParams;
}): Promise<PaginatedResult<Proposal[]>> {
  const { contracts, ui } = Tenant.current();

  // Load proposal types for adaptation
  const typesFromApi = await getProposalTypesFromDaoNode();
  console.log("typesFromApi", typesFromApi);
  //   console.log("typesFromApi", typesFromApi);
  // Load proposals from JSON file and adapt them to the expected format
  let rawProposals =
    archivedProposalsData as unknown as ProposalPayloadFromDAONode[];

  // Apply filter
  if (filter === "relevant") {
    rawProposals = rawProposals.filter((proposal) => !proposal.cancel_event);
  }
  //   console.log("rawProposals", rawProposals);

  // Adapt proposals to the expected format
  const proposals = rawProposals.map((proposal) =>
    adaptDAONodeResponse(proposal, typesFromApi?.proposal_types || {})
  );
  //   console.log("proposals", proposals);

  // Apply pagination
  const skip = pagination.offset;
  const take = pagination.limit;
  const paginatedProposals = proposals.slice(skip, skip + take);
  //   console.log("paginatedProposals", paginatedProposals);
  // Fetch latest block and votable supply
  const [latestBlock, votableSupply] = await Promise.all([
    getLatestBlockPromise(ui, contracts),
    fetchVotableSupply(),
  ]);

  console.log("latestBlock", latestBlock);
  console.log("votableSupply", votableSupply);
  console.log("paginatedProposals", paginatedProposals);

  // Parse proposals
  const parsedProposals = await Promise.all(
    paginatedProposals.map(async (proposal) => {
      const quorum = await fetchQuorumForProposal(proposal);

      return parseProposal(
        proposal,
        latestBlock,
        quorum ?? null,
        BigInt(votableSupply),
        undefined
      );
    })
  );

  return {
    meta: {
      has_next: skip + take < proposals.length,
      total_returned: paginatedProposals.length,
      next_offset: skip + take,
    },
    data: parsedProposals.filter((p) => p !== null) as Proposal[],
  };
}

export const fetchArchivedProposals = cache(getArchivedProposals);
