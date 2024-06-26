import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { frequencyToDateAndSQLcrit } from "@/app/api/common/utils/frequencyHandling";
import { cache } from "react";

type TokenBalance = {
  day: string;
  date: string;
  ts: number;
  balance_usd: number;
};

async function getTreasuryBalanceTS(frequency: string) {
  const { contracts } = Tenant.current();

  const { lookback, skipCrit } = frequencyToDateAndSQLcrit(frequency, "day");

  const crit = `(${contracts.treasury?.map((value: string) => `'${value}'`).join(", ")})`;

  const QRY = `SELECT day,
                TO_CHAR(day, 'YYYY-MM-DD') date,
                extract(epoch from day) as ts,
                ROUND(SUM(balance_usd)::numeric,0) balance_usd
              FROM   dune.token_balances tb
              WHERE  chain_id = 1
                AND day >= (CURRENT_DATE - INTERVAL '${lookback} day')
                AND ${skipCrit}
                AND address IN ${crit}
              GROUP BY 1 
              ORDER BY day`;

  console.log("---------------------------------");
  console.log(QRY);
  console.log("---------------------------------");

  const result = await prisma.$queryRawUnsafe<TokenBalance[]>(QRY);
  return { result };
}

// TODO: Discuss with Jeff
export const apiFetchTreasuryBalanceTS = cache(getTreasuryBalanceTS);


export async function GET(request: NextRequest) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const frequency = request.nextUrl.pathname.split("/")[3];

  try {
    const communityInfo = await apiFetchTreasuryBalanceTS(frequency);
    return NextResponse.json(communityInfo);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
