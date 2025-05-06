import "server-only";

import { prismaWeb2Client } from "@/app/lib/prisma";
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

  return prismaWeb2Client.delegateStatements
    .findFirst({
      where: {
        address: address.toLowerCase(),
        dao_slug: slug,
      },
    })
    .catch((error) => console.error(error));
}

export const fetchDelegateStatement = cache(getDelegateStatement);

// This section will handle fetching multiple delegates as drafts become permissible.
// The above will remain for now to maintain reverse compatibility, but may be depricated in the future.

export const getDelegateStatements = (addressOrENSName: string) => {
  return doInSpan(
    {
      name: "getDelegateStatements",
    },
    () => getDelegateStatementsForAddress({ address: addressOrENSName })
  );
};

/*
  Gets delegate statements from Postgres
*/
async function getDelegateStatementsForAddress({
  address,
}: {
  address: string;
}) {
  const { slug } = Tenant.current();

  return prismaWeb2Client.delegateStatements
    .findMany({
      where: {
        address: address.toLowerCase(),
        dao_slug: slug,
        stage: "published",
      },
    })
    .catch((error) => console.error(error));
}

export const fetchDelegateStatements = cache(getDelegateStatements);
