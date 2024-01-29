import "server-only";

import { parseProposal } from "@/lib/proposalUtils";
import prisma from "@/app/lib/prisma";
import provider from "@/app/lib/provider";
import { Proposals } from "@prisma/client";
import { OptimismContracts } from "@/lib/contracts/contracts";
import { getQuorumForProposal } from "../quorum/getQuorum";
import { getVotableSupply } from "../votableSupply/getVotableSupply";
import { DEPLOYMENT_NAME } from "@/lib/config";

export async function getNeedsMyVoteProposals({
  address,
}: {
  address: string;
}) {
  const [latestBlock, votableSupply] = await Promise.all([
    provider.getBlock("latest"),
    getVotableSupply(),
  ]);

  if (!latestBlock) {
    throw new Error("Could not get latest block");
  }

  const prodDataOnly =
    process.env.NEXT_PUBLIC_AGORA_ENV === "prod"
      ? `AND contract = ${OptimismContracts.governor.address.toLowerCase()}`
      : "";

  // get only proposals from the prod contract
  const proposals = await prisma.$queryRawUnsafe<Proposals[]>(
    `
      SELECT p.*
      FROM (
        SELECT *
        FROM ${DEPLOYMENT_NAME + ".proposals"}
        WHERE CAST(start_block AS INTEGER) < $1
          AND CAST(end_block AS INTEGER) > $1
          AND cancelled_block IS NULL
          ${prodDataOnly}
      ) AS p
      LEFT JOIN ${
        DEPLOYMENT_NAME + ".votes"
      } v ON p.proposal_id = v.proposal_id AND v.voter = $2
      WHERE v.proposal_id IS NULL;
      `,
    latestBlock.number,
    address.toLowerCase()
  );

  const resolvedProposals = Promise.all(
    proposals.map(async (proposal) => {
      const quorum = await getQuorumForProposal(proposal);
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
