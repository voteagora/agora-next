import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { cache } from "react";

type TokenBalance = {
  day: string;
  date: string;
  ts: number;
  balance_usd: number;
};

function frequencyToDates(frequency: string): {
  lookback: number;
  skipCrit: string;
} {
  const periodLowerCase = frequency.toLowerCase();

  let lookback: number;
  let skipCrit: string;

  switch (periodLowerCase) {
    case "24h":
      lookback = 90;
      skipCrit = "1=1";
      break;
    case "7d":
      lookback = 180;
      skipCrit = "extract(DOW from day) = extract(DOW from current_date)";
      break;
    case "1mo":
      lookback = 365;
      skipCrit = "extract(DAY from day) = 1";
      break;
    case "3mo":
      lookback = 365;
      skipCrit =
        "extract(DAY from day) = 1 AND mod(extract(MONTH from day), 3) = 0";
      break;
    case "1y":
      lookback = 365 * 2;
      skipCrit = "extract(DAY from day) = 31 AND extract(MONTH from day) = 12";
      break;
    default:
      throw new Error("Invalid frequency value");
  }

  return { lookback, skipCrit };
}

async function getTreasuryBalanceTS(frequency: string) {
  const { contracts } = Tenant.current();

  const { lookback, skipCrit } = frequencyToDates(frequency);

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

  const result = await prisma.$queryRawUnsafe<TokenBalance[]>(QRY);

  return { result };
}

const fetchTreasuryBalanceTS = cache(getTreasuryBalanceTS);

export async function GET(request: NextRequest) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const frequency = request.nextUrl.pathname.split("/")[3];

  try {
    const communityInfo = await fetchTreasuryBalanceTS(frequency);
    return NextResponse.json(communityInfo);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
