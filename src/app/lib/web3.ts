
import { PrismaClient } from "@prisma/client";

const globalForWeb3 = globalThis as unknown as {
  web3Prisma?: PrismaClient;
};

const isDev = process.env.DATABASE_URL === "dev";

const datasourceUrl = isDev
  ? process.env.READ_ONLY_WEB3_DATABASE_URL_DEV
  : process.env.READ_ONLY_WEB3_DATABASE_URL_PROD;

if (!datasourceUrl) {
  throw new Error("Missing WEB3 database URL environment variable");
}

export const prismaWeb3Client =
  globalForWeb3.web3Prisma ??
  new PrismaClient({
    datasourceUrl: `${datasourceUrl}?pgbouncer=true&pool_timeout=0&connection_limit=1`,
    log: ["error"],
  });

globalForWeb3.web3Prisma = prismaWeb3Client;

// Prisma BigInt serialization
BigInt.prototype.toJSON = function () {
  return this.toString();
};
