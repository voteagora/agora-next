import { NextRequest, NextResponse } from "next/server";
import { fetchProposal } from "@/app/api/common/proposals/getProposals";
import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { formatNumber } from "@/lib/tokenUtils";
import { unstable_cache } from "next/cache";
import { fetchProposalFromArchive } from "@/lib/archiveUtils";
import { archiveToProposal } from "@/lib/proposals";

export const runtime = "nodejs";

type ProposalEmbedData = {
  id: string;
  title: string;
  status: string;
  proposer: string;
  proposalType: string;
  voteStats?: {
    for: string;
    against: string;
    abstain: string;
    forRaw?: string;
    againstRaw?: string;
    abstainRaw?: string;
    forPercentage: number;
    againstPercentage: number;
    abstainPercentage: number;
    quorum?: string;
  };
  startTime?: string;
  endTime?: string;
  url: string;
};

async function loadProposal(proposalId: string): Promise<Proposal> {
  const { namespace, token, ui } = Tenant.current();
  const useArchive = ui.toggle("use-archive-for-proposal-details")?.enabled;

  if (useArchive) {
    const archiveResults = await fetchProposalFromArchive(
      namespace,
      proposalId
    );

    const archiveProposal = archiveResults ? archiveResults : undefined;
    if (archiveProposal) {
      const normalizedProposal = archiveToProposal(archiveProposal, {
        namespace,
        tokenDecimals: token.decimals ?? 18,
      });

      return normalizedProposal;
    }

    throw new Error("Proposal not found in archive");
  }

  return await fetchProposal(proposalId);
}

async function getProposalEmbedData(
  proposalId: string
): Promise<ProposalEmbedData> {
  const proposal = await loadProposal(proposalId);

  const title =
    proposal.markdowntitle ||
    proposal.description?.split("\n")[0] ||
    "Proposal";

  let voteStats = undefined;
  if (proposal.proposalResults) {
    const results = proposal.proposalResults as any;

    if (results.for !== undefined && results.against !== undefined) {
      const forVotes = BigInt(results.for || "0");
      const againstVotes = BigInt(results.against || "0");
      const abstainVotes = BigInt(results.abstain || "0");
      const totalVotes = forVotes + againstVotes + abstainVotes;

      if (totalVotes > 0n) {
        voteStats = {
          for: formatNumber(forVotes),
          against: formatNumber(againstVotes),
          abstain: formatNumber(abstainVotes),
          forRaw: forVotes.toString(),
          againstRaw: againstVotes.toString(),
          abstainRaw: abstainVotes.toString(),
          forPercentage: Number((forVotes * 100n) / totalVotes),
          againstPercentage: Number((againstVotes * 100n) / totalVotes),
          abstainPercentage: Number((abstainVotes * 100n) / totalVotes),
          quorum: proposal.quorum ? formatNumber(proposal.quorum) : undefined,
        };
      }
    }
  }

  return {
    id: proposal.id,
    title: title.replace(/^#+\s*/, ""),
    status: proposal.status || "UNKNOWN",
    proposer: proposal.proposer,
    proposalType: proposal.proposalType || "Standard",
    voteStats,
    startTime: proposal.startTime?.toISOString(),
    endTime: proposal.endTime?.toISOString(),
    url: `/proposals/${proposal.id}`,
  };
}

const getCachedProposalEmbedData = unstable_cache(
  async (proposalId: string) => getProposalEmbedData(proposalId),
  ["proposal-embed"],
  {
    revalidate: 300, // 5 minutes
    tags: ["proposal-embed"],
  }
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  try {
    const { proposalId } = await params;

    if (!proposalId) {
      return NextResponse.json(
        { error: "Proposal ID is required" },
        { status: 400 }
      );
    }

    const embedData = await getCachedProposalEmbedData(proposalId);

    return NextResponse.json(embedData, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching proposal embed data:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposal data" },
      { status: 500 }
    );
  }
}
