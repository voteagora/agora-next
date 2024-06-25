import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { cache } from "react";

type ProposalCount = {
  proposalId: number;
  votes: number;
};

async function getProposalVoteCounts() {
  const { namespace } = Tenant.current();

  const QRY = `SELECT proposal_id,
                    SUM(vote_count) votes
                FROM   alltenant.dao_engagement_votes
                WHERE  tenant = '${namespace}'
                    GROUP  BY 1
                    ORDER  BY 1`;

  const result = await prisma.$queryRawUnsafe<ProposalCount[]>(QRY);

  return { result };
}

const fetchProposalVoteCounts = cache(getProposalVoteCounts);

export async function GET(request: NextRequest) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  try {
    const communityInfo = await fetchProposalVoteCounts();
    return NextResponse.json(communityInfo);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
