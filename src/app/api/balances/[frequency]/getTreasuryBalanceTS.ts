import Tenant from "@/lib/tenant/tenant";
import { frequencyToLookbackDayCount } from "@/app/api/common/utils/frequencyHandling";
import { prismaWeb2Client } from "@/app/lib/prisma";
import type { MetricTimeSeriesValue } from "@/lib/types";
import { cache } from "react";

async function getTreasuryBalanceTS(
  frequency: string
): Promise<{ result: MetricTimeSeriesValue[] }> {
  const { contracts } = Tenant.current();

  if (!contracts.treasury || contracts.treasury.length === 0) {
    return { result: [] };
  }

  if (frequency == "latest") {
    const { result } = await getTreasuryBalanceTS("3d");
    const lastObject = result[result.length - 1];
    return { result: [lastObject] };
  }

  const chainId = contracts.token?.chain?.id;
  const { lookback } = frequencyToLookbackDayCount(frequency);
  const crit = `(${contracts.treasury?.map((value: string) => `'${value}'`).join(", ") ?? ""})`;

  const QRY = `SELECT day,
                TO_CHAR(day, 'YYYY-MM-DD') date,
                ROUND(SUM(balance_usd)::numeric,0) value
              FROM   dune.token_balances tb
              WHERE  chain_id = ${chainId}
                AND day >= (CURRENT_DATE - INTERVAL '${lookback} day')
                AND address IN ${crit}
              GROUP BY 1
              ORDER BY day`;

  const result = (await prismaWeb2Client.$queryRawUnsafe(
    QRY
  )) as MetricTimeSeriesValue[];
  return { result };
}

export const apiFetchTreasuryBalanceTS = cache(getTreasuryBalanceTS);
