
import { PrismaClient } from "@prisma/client";

const globalForWeb3 = globalThis as unknown as {
  web2Prisma?: PrismaClient;
};

const isDev = process.env.DATABASE_URL === "dev";

const datasourceUrl = isDev
  ? process.env.READ_WRITE_WEB2_DATABASE_URL_DEV
  : process.env.READ_WRITE_WEB2_DATABASE_URL_PROD;

if (!datasourceUrl) {
  throw new Error("Missing WEB2 database URL environment variable");
}

export const prismaWeb3Client =
  globalForWeb3.web2Prisma ??
  new PrismaClient({
    datasourceUrl,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForWeb3.web2Prisma = prismaWeb3Client;
}

// Prisma BigInt serialization
BigInt.prototype.toJSON = function () {
  return this.toString();
};
