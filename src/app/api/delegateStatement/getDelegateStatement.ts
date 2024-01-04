import prisma from "@/app/lib/prisma";

import "server-only";

export function getDelegateStatement(address: string) {
  return prisma.delegateStatements.findFirst({ where: { address } });
}
