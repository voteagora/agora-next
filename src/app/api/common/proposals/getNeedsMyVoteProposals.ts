import { parseProposal } from "@/lib/proposalUtils";
import prisma from "@/app/lib/prisma";
import provider from "@/app/lib/provider";
import Tenant from "@/lib/tenant/tenant";
import { ProposalPayload } from "./proposal";
import { getVotableSupply } from "../votableSupply/getVotableSupply";
import { getQuorumForProposal } from "../quorum/getQuorum";

export async function getNeedsMyVoteProposals(address: string) {
  const { namespace, contracts } = Tenant.current();
  const [latestBlock, votableSupply] = await Promise.all([
    provider.getBlockNumber(),
    getVotableSupply(),
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
        FROM ${namespace + ".proposals"}
        WHERE CAST(start_block AS INTEGER) < $1
          AND CAST(end_block AS INTEGER) > $1
          AND cancelled_block IS NULL
          ${prodDataOnly}
      ) AS p
      LEFT JOIN ${
        namespace + ".votes"
      } v ON p.proposal_id = v.proposal_id AND v.voter = $2
      WHERE v.proposal_id IS NULL
      ORDER BY p.ordinal DESC;
      `,
    latestBlock,
    address.toLowerCase(),
    contracts.governor.address,
  );

  const resolvedProposals = Promise.all(
    proposals.map(async (proposal) => {
      const quorum = await getQuorumForProposal(proposal);
      return parseProposal(
        proposal,
        latestBlock,
        quorum ?? null,
        BigInt(votableSupply),
      );
    }),
  );

  return {
    proposals: await resolvedProposals,
  };
}
