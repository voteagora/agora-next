import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { cache } from "react";

type AddressWeight = {
  address: string;
  weight: string;
};

async function getTopDelegateWeights() {
  const { contracts } = Tenant.current();

  const QRY = `WITH 
                
                total_voting_power
                AS (SELECT Sum(voting_power) tot
                    FROM   uniswap.delegates
                    WHERE  contract = '${contracts.token.address}'),
                
                weightings
                AS (SELECT delegate,
                            voting_power / (SELECT tot
                                            FROM   total_voting_power) AS
                            fraction_of_voting_power
                    FROM   uniswap.delegates
                    WHERE  direct_vp > 0
                    ORDER  BY voting_power)

                SELECT delegate AS address,
                       round(fraction_of_voting_power * 100.0,3) AS weight
                FROM   weightings
                ORDER  BY fraction_of_voting_power DESC
                LIMIT 10; `;

  const result = await prisma.$queryRawUnsafe<AddressWeight[]>(QRY);

  return { result };
}

const fetchDelegateWeights = cache(getTopDelegateWeights);

export async function GET(request: NextRequest) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  try {
    const weights = await fetchDelegateWeights();
    return NextResponse.json(weights);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
