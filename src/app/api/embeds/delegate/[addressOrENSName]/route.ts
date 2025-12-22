import { NextRequest, NextResponse } from "next/server";
import { fetchDelegate } from "@/app/delegates/actions";
import { ensNameToAddress } from "@/app/lib/ENSUtils";
import Tenant from "@/lib/tenant/tenant";
import { formatNumber } from "@/lib/tokenUtils";
import { unstable_cache } from "next/cache";

export const runtime = "nodejs";

type DelegateEmbedData = {
  address: string;
  votingPower: string;
  delegatorsCount: number;
  proposalsCreated: number;
  voteStats?: {
    forVotes: number;
    againstVotes: number;
    abstainVotes: number;
  };
  statement?: string;
  url: string;
};

async function getDelegateEmbedData(
  addressOrENSName: string
): Promise<DelegateEmbedData> {
  const address = await ensNameToAddress(addressOrENSName);
  const delegate = await fetchDelegate(address);
  const { token } = Tenant.current();

  const statement = delegate.statement?.payload?.delegateStatement;

  const forVotes = parseInt(delegate.votedFor || "0", 10);
  const againstVotes = parseInt(delegate.votedAgainst || "0", 10);
  const abstainVotes = parseInt(delegate.votedAbstain || "0", 10);

  return {
    address: delegate.address,
    votingPower: delegate.votingPower?.total
      ? `${formatNumber(delegate.votingPower.total)} ${token.symbol}`
      : "0",
    delegatorsCount: Number(delegate.numOfDelegators || 0n),
    proposalsCreated: Number(delegate.proposalsCreated || 0n),
    voteStats:
      forVotes + againstVotes + abstainVotes > 0
        ? {
            forVotes,
            againstVotes,
            abstainVotes,
          }
        : undefined,
    statement: statement ? statement.slice(0, 150) : undefined,
    url: `/delegates/${addressOrENSName}`,
  };
}

const getCachedDelegateEmbedData = unstable_cache(
  async (addressOrENSName: string) => getDelegateEmbedData(addressOrENSName),
  ["delegate-embed"],
  {
    revalidate: 300, // 5 minutes
    tags: ["delegate-embed"],
  }
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ addressOrENSName: string }> }
) {
  try {
    const { addressOrENSName } = await params;

    if (!addressOrENSName) {
      return NextResponse.json(
        { error: "Address or ENS name is required" },
        { status: 400 }
      );
    }

    const embedData = await getCachedDelegateEmbedData(addressOrENSName);

    return NextResponse.json(embedData, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching delegate embed data:", error);
    return NextResponse.json(
      { error: "Failed to fetch delegate data" },
      { status: 500 }
    );
  }
}
