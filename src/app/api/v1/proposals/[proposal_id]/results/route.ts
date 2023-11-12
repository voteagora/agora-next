import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getQuorumForProposal, parseProposalType } from "@/lib/proposalUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: { proposal_id: string } }
) {
  const results = await prisma.proposalsResults.findFirst({
    where: { proposal_id: params.proposal_id },
  });

  if (!results) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const proposal = await prisma.proposalsData.findFirst({
    where: { proposal_id: params.proposal_id },
  });

  const proposalType = parseProposalType(results.proposal_data ?? "{}");
  const quorum = await getQuorumForProposal(proposal, "OPTIMISM");

  // Build out proposal response
  const response = {
    proposalType: proposalType,
    quorum: quorum,
    results: {
      approval:
        proposalType === "APPROVAL"
          ? parseApprovalResults(
              results.proposal_data ?? "{}",
              results.approval_results as Array<{
                param: number;
                votes: number;
              }>
            )
          : null,
      standard: parseStandardResults(
        results.standard_results as {
          "0": number;
          "1": number;
          "2": number;
        } | null,
        proposalType === "APPROVAL"
      ),
    },
  };

  return NextResponse.json(response);
}

function parseStandardResults(
  results: { "0": number; "1": number; "2": number } | null,
  isApproval: boolean
) {
  if (!results) {
    return null;
  }
  return Object.entries(results).map(([key, value]) => {
    let newKey;
    switch (Number(key)) {
      case 0:
        newKey = isApproval ? 1 : -1; // FOR / AGAINST
        break;
      case 1:
        newKey = isApproval ? 0 : 1; // ABSTAIN / FOR
        break;
      case 2:
        newKey = -1;
        break;
    }
    return {
      option: newKey,
      votes: value,
    };
  });
}

function parseApprovalResults(
  proposalData: string,
  results: Array<{ param: number; votes: number }>
) {
  const data = JSON.parse(proposalData);
  if (!Array.isArray(data)) {
    return null;
  }
  try {
    const proposalOptions = data[0];

    return results.map(({ param, votes }) => {
      const idx = Number(param);
      return {
        option: proposalOptions[idx][0],
        votes: votes,
      };
    });
  } catch (e) {
    return null;
  }
}
