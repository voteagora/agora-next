import prisma from "@/app/lib/prisma";
import { DelegateStatementFormValues } from "@/components/DelegateStatement/DelegateStatementForm";
import { DaoSlug, type Prisma } from "@prisma/client";

import "server-only";

export function createDelegateStatement(address: string, delegateStatement: DelegateStatementFormValues, signature: string) {
  const { daoSlug, twitter, discord, email } = delegateStatement;

  return prisma.delegateStatements.create({
    data: {
      address,
      dao_slug: daoSlug as DaoSlug,
      signature,
      payload: delegateStatement as Prisma.InputJsonValue,
      twitter,
      discord,
      email
    }
  })
}
