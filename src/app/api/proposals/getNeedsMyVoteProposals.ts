import { notFound } from "next/navigation";
import { paginatePrismaResult } from "@/app/lib/pagination";
import { parseProposal } from "@/lib/proposalUtils";
import prisma from "@/app/lib/prisma";
import provider from "@/app/lib/provider";
import { Proposals } from "@prisma/client";

import "server-only";
import { OptimismContracts } from "@/lib/contracts/contracts";
import { getQuorumForProposal } from "../quorum/getQuorum";
import { getVotableSupply } from "../votableSupply/getVotableSupply";

export async function getNeedsMyVoteProposals({
  address,
}: {
  address: string;
}) {
  const latestBlock = await provider.getBlock("latest");
  const votableSupply = await getVotableSupply();

  let proposals: Proposals[];

  if (process.env.NEXT_PUBLIC_AGORA_ENV === "prod") {
    // get only proposals from the prod contract
    proposals = await prisma.$queryRaw`
      SELECT p.*
      FROM (
        SELECT *
        FROM "center"."proposals"
        WHERE CAST(start_block AS INTEGER) < ${latestBlock?.number}
          AND CAST(end_block AS INTEGER) > ${latestBlock?.number}
          AND cancelled_block IS NULL
          AND p.contract = ${OptimismContracts.governor.address.toLowerCase()}
      ) AS p
      LEFT JOIN "center"."votes" v ON p.proposal_id = v.proposal_id AND v.voter = ${address.toLowerCase()}
      WHERE v.proposal_id IS NULL;
      `;
  } else {
    // get proposals from anywhere
    proposals = await prisma.$queryRaw`
      SELECT p.*
      FROM (
        SELECT *
        FROM "center"."proposals"
        WHERE CAST(start_block AS INTEGER) < ${latestBlock?.number}
          AND CAST(end_block AS INTEGER) > ${latestBlock?.number}
          AND cancelled_block IS NULL
      ) AS p
      LEFT JOIN "center"."votes" v ON p.proposal_id = v.proposal_id AND v.voter = ${address.toLowerCase()}
      WHERE v.proposal_id IS NULL;
      `;
  }

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
