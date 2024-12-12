"use server";

import prisma from "@/app/lib/prisma";

async function voteForProposalDraft({
  address,
  proposalId,
  direction,
}: {
  address: `0x${string}`;
  proposalId: string;
  direction: 1 | -1;
}) {
  return await prisma.proposalDraftVote.upsert({
    where: {
      voter_proposal_id: {
        voter: address,
        proposal_id: parseInt(proposalId),
      },
    },
    update: {
      weight: 1,
      direction,
    },
    create: {
      voter: address,
      proposal_id: parseInt(proposalId),
      weight: 1,
      direction,
    },
  });
}

export default voteForProposalDraft;
