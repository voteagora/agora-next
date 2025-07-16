import "server-only";

import { prismaWeb2Client } from "@/app/lib/prisma";
import { cache } from "react";
import Tenant from "@/lib/tenant/tenant";

import { doInSpan } from "@/app/lib/logging";
import { stageStatus } from "@/app/lib/sharedEnums";

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

  return prismaWeb2Client.delegateStatements
    .findFirst({
      where: {
        address: address.toLowerCase(),
        dao_slug: slug,
        stage: stageStatus.PUBLISHED,
      },
      orderBy: {
        updated_at_ts: "desc",
      },
    })
    .catch((error) => console.error(error));
}

/**
 * Gets delegate statements for multiple addresses
 */
export async function getDelegateStatementsForAddresses({
  addresses,
  stage,
}: {
  addresses: string[];
  stage?: stageStatus;
}) {
  const { slug } = Tenant.current();

  return doInSpan(
    {
      name: "getDelegateStatementsForAddresses",
    },
    async () => {
      const lowercasedAddresses = addresses.map((addr) => addr.toLowerCase());

      return prismaWeb2Client.delegateStatements
        .findMany({
          where: {
            address: { in: lowercasedAddresses },
            dao_slug: slug,
            stage: stage || stageStatus.PUBLISHED,
          },
          orderBy: {
            updated_at_ts: "desc",
          },
        })
        .catch((error) => {
          console.error(error);
          return [];
        });
    }
  );
}

export const fetchDelegateStatements = cache(getDelegateStatementsForAddresses);
export const fetchDelegateStatement = cache(getDelegateStatement);

export const getDelegateStatements = (
  addressOrENSName: string,
  stage?: stageStatus
) => {
  return doInSpan(
    {
      name: "getDelegateStatements",
    },
    () =>
      getDelegateStatementsForAddress({
        address: addressOrENSName,
        stage: stage,
      })
  );
};

/*
  Gets multiple delegate statements from Postgres
*/
export async function getDelegateStatementsForAddress({
  address,
  stage,
}: {
  address: string;
  stage?: stageStatus;
}) {
  const { slug } = Tenant.current();

  if (!stage) {
    return prismaWeb2Client.delegateStatements
      .findMany({
        where: {
          address: address.toLowerCase(),
          dao_slug: slug,
          stage: stageStatus.PUBLISHED,
        },
        orderBy: {
          updated_at_ts: "desc",
        },
      })
      .catch((error) => console.error(error));
  } else {
    return prismaWeb2Client.delegateStatements
      .findMany({
        where: {
          address: address.toLowerCase(),
          dao_slug: slug,
          stage: stage,
        },
        orderBy: {
          updated_at_ts: "desc",
        },
      })
      .catch((error) => console.error(error));
  }
}
