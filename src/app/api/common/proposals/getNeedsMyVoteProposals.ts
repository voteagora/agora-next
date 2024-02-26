import { parseProposal } from "@/lib/proposalUtils";
import prisma from "@/app/lib/prisma";
import provider from "@/app/lib/provider";
import Tenant from "@/lib/tenant";
import { ProposalPayload } from "./proposal";
import { getVotableSupplyForNamespace } from "../votableSupply/getVotableSupply";
import { getQuorumForProposalForNamespace } from "../quorum/getQuorum";
import {contracts} from "@/lib/contracts/contracts";

export async function getNeedsMyVoteProposals(
  address:string
) {

  const tenant = Tenant.getInstance();
  const [latestBlock, votableSupply] = await Promise.all([
    provider.getBlockNumber(),
    getVotableSupplyForNamespace({ namespace:tenant.namespace }),
  ]);

  if (!latestBlock) {
    throw new Error("Could not get latest block");
  }

  const prodDataOnly =
    process.env.NEXT_PUBLIC_AGORA_ENV === "prod" ? `AND contract = $3` : "";

  const proposals = await prisma.$queryRawUnsafe<ProposalPayload[]>(
    `
      SELECT p.*
      FROM (
        SELECT *
        FROM ${tenant.namespace + ".proposals"}
        WHERE CAST(start_block AS INTEGER) < $1
          AND CAST(end_block AS INTEGER) > $1
          AND cancelled_block IS NULL
          ${prodDataOnly}
      ) AS p
      LEFT JOIN ${
        tenant.namespace + ".votes"
      } v ON p.proposal_id = v.proposal_id AND v.voter = $2
      WHERE v.proposal_id IS NULL
      ORDER BY p.ordinal DESC;
      `,
    latestBlock,
    address.toLowerCase(),
    contracts(tenant.namespace).governor.address.toLowerCase()
  );

  const resolvedProposals = Promise.all(
    proposals.map(async (proposal) => {
      const quorum = await getQuorumForProposalForNamespace({
        proposal,
        namespace:tenant.namespace,
      });
      return parseProposal(
        proposal,
        latestBlock,
        quorum,
        BigInt(votableSupply)
      );
    })
  );

  return {
    proposals: await resolvedProposals,
  };
}
