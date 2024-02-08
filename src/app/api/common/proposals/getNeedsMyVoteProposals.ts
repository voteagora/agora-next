import { parseProposal } from "@/lib/proposalUtils";
import prisma from "@/app/lib/prisma";
import provider from "@/app/lib/provider";
import { contracts } from "@/lib/contracts/contracts";
import { ProposalPayload } from "./proposal";
import { getVotableSupplyForNamespace } from "../votableSupply/getVotableSupply";
import { getQuorumForProposalForNamespace } from "../quorum/getQuorum";

export async function getNeedsMyVoteProposalsForNamespace({
  address,
  namespace,
}: {
  address: string;
  namespace: "optimism";
}) {
  const [latestBlock, votableSupply] = await Promise.all([
    provider.getBlock("latest"),
    getVotableSupplyForNamespace({ namespace }),
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
          AND proposal_id NOT IN (
            '57313970497775509650078368977617149711853442797980762814963940688863876135300',
            '91935073049343644222262531048391052556386406003169247850366587136711778004389',
            '68746199148565396042614148114788529673736007721756628873700096397015238013581',
            '94309269558964448448900895115129035406207299612350696403100150360600941762534',
            '110421945337145674755337791449307926523882947474955336225598126770999669868176'
          )
          ${prodDataOnly}
      ) AS p
      LEFT JOIN ${
        namespace + ".votes"
      } v ON p.proposal_id = v.proposal_id AND v.voter = $2
      WHERE v.proposal_id IS NULL;
      `,
    latestBlock.number,
    address.toLowerCase(),
    contracts(namespace).governor.address.toLowerCase()
  );

  const resolvedProposals = Promise.all(
    proposals.map(async (proposal) => {
      const quorum = await getQuorumForProposalForNamespace({
        proposal,
        namespace,
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
