import "server-only";

import prisma from "@/app/lib/prisma";
import { DelegateStatementFormValues } from "@/components/DelegateStatement/CurrentDelegateStatement";
import { type DaoSlug, Prisma } from "@prisma/client";
import verifyMessage from "@/lib/serverVerifyMessage";

export async function createDelegateStatement({ address, delegateStatement, signature, message }: {
  address: `0x${string}`,
  delegateStatement: DelegateStatementFormValues,
  signature: `0x${string}`,
  message: string
}) {
  const { daoSlug, twitter, discord, email } = delegateStatement;

  const valid = await verifyMessage({
    address,
    message,
    signature,
    daoSlug: daoSlug as DaoSlug
  });

  if (!valid) {
    throw new Error("Invalid signature");
  }

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
