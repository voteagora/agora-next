import "server-only";

import prisma from "@/app/lib/prisma";
import { DelegateStatementFormValues } from "@/components/DelegateStatement/DelegateStatementForm";
import { DaoSlug, type Prisma } from "@prisma/client";

export function createDelegateStatement(address: string, delegateStatement: DelegateStatementFormValues, signature: string) {
  const { daoSlug, twitter, discord, email } = delegateStatement;
  const data = {
    address: address.toLowerCase(),
    dao_slug: daoSlug as DaoSlug,
    signature,
    payload: delegateStatement as Prisma.InputJsonValue,
    twitter,
    discord,
    email
  };

  return prisma.delegateStatements.upsert({
    where: {
      address_dao_slug: {
        address: address.toLowerCase(),
        dao_slug: daoSlug as DaoSlug,
      },
    },
    update: data,
    create: data,
  });
}
