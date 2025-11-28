
import { PrismaClient } from "@prisma/client";

const globalForWeb2 = globalThis as unknown as {
  web2Prisma?: PrismaClient;
};

const isDev = process.env.DATABASE_URL === "dev";

const datasourceUrl = isDev
  ? process.env.READ_WRITE_WEB2_DATABASE_URL_DEV
  : process.env.READ_WRITE_WEB2_DATABASE_URL_PROD;

if (!datasourceUrl) {
  throw new Error("Missing WEB2 database URL environment variable");
}

export const prismaWeb2Client =
  globalForWeb2.web2Prisma ??
  new PrismaClient({
    datasourceUrl: `${datasourceUrl}?pgbouncer=true&pool_timeout=0&connection_limit=1`,
    log: ["error"],
  });


  globalForWeb2.web2Prisma = prismaWeb2Client;


// Prisma BigInt serialization
BigInt.prototype.toJSON = function () {
  return this.toString();
};
