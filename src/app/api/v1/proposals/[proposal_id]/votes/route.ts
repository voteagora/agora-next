import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  parseParams,
  parseProposalType,
  parseSupport,
} from "@/lib/proposalUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: { proposal_id: string } }
) {
  let page = parseInt(request.nextUrl.searchParams.get("page") ?? "0", 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  const sortByPower = request.nextUrl.searchParams.get("sortByPower");

  const pageSize = 50;
  // TODO: Figure out a better way to paginate -- use cursor
  const total_pages = Math.ceil(10000 / pageSize);

  const votes = await prisma.$queryRaw<Prisma.VotesGetPayload<true>[]>(
    Prisma.sql`
      SELECT * FROM center.votes
      WHERE proposal_id = ${params.proposal_id}
      ORDER BY ${sortByPower ? "weight" : "block_number"} DESC
      LIMIT ${pageSize}
      OFFSET ${(page - 1) * pageSize}
    `
  );

  // TODO: This is too slow because prisma default sorts by block_number -- need to add an index
  // const votes = await prisma.votes.findMany({
  //   where: { proposal_id: params.proposal_id },
  //   take: pageSize,
  //   skip: (page - 1) * pageSize,
  //   orderBy: sortByPower
  //     ? {
  //         weight: "desc", // or "as" if you want ascending order
  //       }
  //     : {
  //         block_number: "desc", // or "asc" if you want ascending order
  //       },
  // });

  const proposalType = parseProposalType(votes[0].proposal_data ?? "{}");

  // Build out proposal response
  const response = {
    meta: {
      current_page: page,
      total_pages: total_pages,
      page_size: pageSize,
      total_count: 10000,
    },
    votes: votes.map((vote) => ({
      address: vote.voter,
      proposal_id: vote.proposal_id,
      support: parseSupport(vote.support, proposalType),
      amount: vote.weight,
      reason: vote.reason,
      params: parseParams(vote.params, vote.proposal_data),
    })),
  };

  return NextResponse.json(response);
}
