import "server-only";

import { prismaWeb2Client } from "@/app/lib/prisma";
import { cache } from "react";
import Tenant from "@/lib/tenant/tenant";
import { stageStatus } from "@/app/lib/sharedEnums";
import { doInSpan } from "@/app/lib/logging";

export const getDelegateStatement = (
  addressOrENSName: string,
  stage: stageStatus
) => {
  return doInSpan(
    {
      name: "getDelegateStatement",
    },
    () =>
      getDelegateStatementForAddress({
        address: addressOrENSName,
        stage: stageStatus,
      })
  );
};

/*
  Get a single delegate statement from Postgres or DynamoDB if not found
*/
async function getDelegateStatementForAddress({
  address,
  stage,
}: {
  address: string;
  stage: stageStatus;
}) {
  const { slug } = Tenant.current();

  return prismaWeb2Client.delegateStatements
    .findFirst({
      where: {
        address: address.toLowerCase(),
        dao_slug: slug,
        stage: stage,
      },
    })
    .catch((error) => console.error(error));
}

export const fetchDelegateStatement = cache(getDelegateStatement);

// This section will handle fetching multiple delegates as drafts become permissible.
// The above will remain for now to maintain reverse compatibility, but may be depricated in the future.

export const getDelegateStatements = (
  addressOrENSName: string,
  stage: stageStatus
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
async function getDelegateStatementsForAddress({
  address,
  stage,
}: {
  address: string;
  stage: stageStatus;
}) {
  const { slug } = Tenant.current();

  return prismaWeb2Client.delegateStatements
    .findMany({
      where: {
        address: address.toLowerCase(),
        dao_slug: slug,
        stage: stage,
      },
    })
    .catch((error) => console.error(error));
}

export const fetchDelegateStatements = cache(getDelegateStatements);
