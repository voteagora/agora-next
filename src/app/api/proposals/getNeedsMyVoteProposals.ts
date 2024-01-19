import { notFound } from "next/navigation";
import { paginatePrismaResult } from "@/app/lib/pagination";
import { parseProposal } from "@/lib/proposalUtils";
import prisma from "@/app/lib/prisma";
import provider from "@/app/lib/provider";

import "server-only";
import { OptimismContracts } from "@/lib/contracts/contracts";
import { getQuorumForProposal } from "../quorum/getQuorum";
import { getVotableSupply } from "../votableSupply/getVotableSupply";

export async function getNeedsMyVoteProposals({
  address,
}: {
  address: string;
}) {
  const prodDataOnly = process.env.NEXT_PUBLIC_AGORA_ENV === "prod" && {
    contract: OptimismContracts.governor.address.toLowerCase(),
  };

  const latestBlock = await provider.getBlock("latest");
  const votableSupply = await getVotableSupply();

  const proposals = await prisma.proposals.findMany({
    skip: 0,
    take: 10,
    orderBy: {
      ordinal: "desc",
    },
    where: {
      ...(prodDataOnly || {}),
      cancelled_block: null,
    },
  });

  console.log(proposals);

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
