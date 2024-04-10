import "server-only";

import prisma from "@/app/lib/prisma";
import { cache } from "react";
import { addressOrEnsNameWrap } from "../utils/ensName";
import Tenant from "@/lib/tenant/tenant";

export const getDelegateStatement = (addressOrENSName: string) =>
  addressOrEnsNameWrap(getDelegateStatementForAddress, addressOrENSName);

/*
  Gets delegate statement from Postgres, or DynamoDB if not found
*/
async function getDelegateStatementForAddress({
  address,
}: {
  address: string;
}) {
  const { slug } = Tenant.current();

  return prisma.delegateStatements
    .findFirst({ where: { address: address.toLowerCase(), dao_slug: slug } })
    .catch((error) => console.error(error));
}

export const fetchDelegateStatement = cache(getDelegateStatement);
