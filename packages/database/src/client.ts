import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient()

if (process.env.NEXT_PUBLIC_ENV !== "prod") global.prisma = prisma

export * from "@prisma/client"
