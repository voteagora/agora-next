import Tenant from "@/lib/tenant/tenant";
import { prismaWeb3Client } from "@/app/lib/prisma";
import { cache } from "react";

type AddressWeight = {
  address: string;
  weight: string;
};

async function getTopDelegateWeights() {
  const { contracts, namespace } = Tenant.current();

  const QRY = `WITH 
                
                total_voting_power
                AS (SELECT Sum(voting_power) tot
                    FROM   ${namespace}.delegates
                    WHERE  contract = '${contracts.token.address.toLowerCase()}'),
                
                weightings
                AS (SELECT delegate,
                            voting_power / (SELECT tot
                                            FROM   total_voting_power) AS
                            fraction_of_voting_power
                    FROM   ${namespace}.delegates
                    WHERE  direct_vp > 0
                    ORDER  BY voting_power)

                SELECT delegate AS address,
                       round(fraction_of_voting_power * 100.0,3) AS weight
                FROM   weightings
                ORDER  BY fraction_of_voting_power DESC
                LIMIT 10; `;

  const result = (await prismaWeb3Client.$queryRawUnsafe(
    QRY
  )) as AddressWeight[];
  return { result };
}

export const apiFetchDelegateWeights = cache(getTopDelegateWeights);
