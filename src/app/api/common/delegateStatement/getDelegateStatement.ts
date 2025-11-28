import "server-only";

import { prismaWeb2Client } from "@/app/lib/web2";
import { cache } from "react";
import Tenant from "@/lib/tenant/tenant";

import { doInSpan } from "@/app/lib/logging";

export const getDelegateStatement = (addressOrENSName: string) => {
  return doInSpan(
    {
      name: "getDelegateStatement",
    },
    () => getDelegateStatementForAddress({ address: addressOrENSName })
  );
};

/*
  Gets delegate statement from Postgres, or DynamoDB if not found
*/
async function getDelegateStatementForAddress({
  address,
}: {
  address: string;
}) {
  const { slug } = Tenant.current();

  const result = await prismaWeb2Client.delegateStatements
    .findFirst({
      where: { address: address.toLowerCase(), dao_slug: slug },
      select: {
        address: true,
        dao_slug: true,
        message_hash: true,
        signature: true,
        payload: true,
        twitter: true,
        warpcast: true,
        discord: true,
        scw_address: true,
        notification_preferences: true,
        endorsed: true,
        createdAt: true,
        updatedAt: true,
        created_at_ts: true,
        updated_at_ts: true,
        stage: true,
      },
    })
    .catch((error) => console.error(error));

  // Remove email from payload if it exists
  if (result && result.payload && typeof result.payload === "object") {
    const { email: _, ...payloadWithoutEmail } = result.payload as any;
    result.payload = payloadWithoutEmail;
  }

  return result;
}

/**
 * Gets delegate statements for multiple addresses
 */
export async function getDelegateStatementsForAddresses({
  addresses,
}: {
  addresses: string[];
}) {
  const { slug } = Tenant.current();

  return doInSpan(
    {
      name: "getDelegateStatementsForAddresses",
    },
    async () => {
      const lowercasedAddresses = addresses.map((addr) => addr.toLowerCase());

      const results = await prismaWeb2Client.delegateStatements
        .findMany({
          where: {
            address: { in: lowercasedAddresses },
            dao_slug: slug,
          },
          select: {
            address: true,
            dao_slug: true,
            message_hash: true,
            signature: true,
            payload: true,
            twitter: true,
            warpcast: true,
            discord: true,
            scw_address: true,
            notification_preferences: true,
            endorsed: true,
            createdAt: true,
            updatedAt: true,
            created_at_ts: true,
            updated_at_ts: true,
            stage: true,
          },
        })
        .catch((error) => {
          console.error(error);
          return [];
        });

      // Remove email from payload if it exists
      return results.map((result) => {
        if (result.payload && typeof result.payload === "object") {
          const { email: _, ...payloadWithoutEmail } = result.payload as any;
          result.payload = payloadWithoutEmail;
        }
        return result;
      });
    }
  );
}

export const fetchDelegateStatements = cache(getDelegateStatementsForAddresses);
export const fetchDelegateStatement = cache(getDelegateStatement);
