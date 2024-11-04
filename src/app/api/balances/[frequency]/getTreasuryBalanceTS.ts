import Tenant from "@/lib/tenant/tenant";
import { frequencyToLookbackDayCount } from "@/app/api/common/utils/frequencyHandling";
import prisma from "@/app/lib/prisma";
import type { MetricTimeSeriesValue } from "@/lib/types";
import { cache } from "react";

async function getTreasuryBalanceTS(
  frequency: string
): Promise<{ result: MetricTimeSeriesValue[] }> {
  if (frequency == "latest") {
    const { result } = await getTreasuryBalanceTS("3d");
    const lastObject = result[result.length - 1];
    return { result: [lastObject] };
  }

  const { contracts } = Tenant.current();
  const chainId = contracts.token?.chain?.id;
  const { lookback } = frequencyToLookbackDayCount(frequency);
  const crit = `(${contracts.treasury?.map((value: string) => `'${value}'`).join(", ") ?? ""})`;
  console.log("testing here");
  console.log(chainId, crit);

  const QRY = `SELECT day,
                TO_CHAR(day, 'YYYY-MM-DD') date,
                ROUND(SUM(balance_usd)::numeric,0) balance_usd
              FROM   dune.token_balances tb
              WHERE  chain_id = ${chainId}
                AND day >= (CURRENT_DATE - INTERVAL '${lookback} day')
                AND address IN ${crit}
              GROUP BY 1
              ORDER BY day`;

  const result = await prisma.$queryRawUnsafe<MetricTimeSeriesValue[]>(QRY);
  return { result };
}

export const apiFetchTreasuryBalanceTS = cache(getTreasuryBalanceTS);
