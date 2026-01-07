import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE === "phase-production-build") {
//   throw new Error("🚨 Prisma query during build!");
// }

declare global {
  var prismaWeb2Client: PrismaClient;
  var prismaWeb3Client: PrismaClient;
}

// Determine environment based on DATABASE_URL first, then fall back to NEXT_PUBLIC_AGORA_ENV
let envSuffix: string;
if (process.env.DATABASE_URL === "dev") {
  envSuffix = "DEV";
} else if (process.env.DATABASE_URL === "prod") {
  envSuffix = "PROD";
} else {
  const isProd = process.env.NEXT_PUBLIC_AGORA_INFRA_ENV === "prod";
  envSuffix = isProd ? "PROD" : "DEV";
}

const resolveDbUrl = (type: "WEB2" | "WEB3") => {
  const databaseUrl = process.env.DATABASE_URL;

  // If DATABASE_URL is set but not to 'dev' or 'prod', use it directly for both clients
  if (databaseUrl && databaseUrl !== "dev" && databaseUrl !== "prod") {
    return databaseUrl;
  }

  const envVarName = `${type === "WEB2" ? "READ_WRITE_WEB2" : "READ_ONLY_WEB3"}_DATABASE_URL_${envSuffix}`;
  const url = process.env[envVarName];
  return url;
};

const readWriteWeb2Url = resolveDbUrl("WEB2");
const readOnlyWeb3Url = resolveDbUrl("WEB3");
let prismaWeb2Client: PrismaClient;
let prismaWeb3Client: PrismaClient;

// Allows tuning connection pool size without code changes
const configuredPoolMax = Number(process.env.PG_ADAPTER_POOL_MAX ?? "2");
const POOL_MAX = Number.isFinite(configuredPoolMax) ? configuredPoolMax : 2;

const makePrismaClient = (databaseUrl: string) => {
  const pool = new Pool({
    connectionString: databaseUrl,
    max: POOL_MAX,
    connectionTimeoutMillis: 5000, // return an error after 5 seconds if connection could not be established
    idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  });

  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
  });

  return new PrismaClient({
    adapter: new PrismaPg(pool),
  });
};

if (process.env.NODE_ENV === "production") {
  if (!readWriteWeb2Url || !readOnlyWeb3Url) {
    throw new Error("Database URLs are not defined in environment variables");
  }

  prismaWeb2Client = makePrismaClient(readWriteWeb2Url) as PrismaClient;
  prismaWeb3Client = makePrismaClient(readOnlyWeb3Url) as PrismaClient;
} else {
  if (!global.prismaWeb2Client) {
    if (!readWriteWeb2Url || !readOnlyWeb3Url) {
      throw new Error("Database URLs are not defined in environment variables");
    }

    global.prismaWeb2Client = makePrismaClient(
      readWriteWeb2Url
    ) as PrismaClient;
    global.prismaWeb3Client = makePrismaClient(readOnlyWeb3Url) as PrismaClient;
  }

  prismaWeb2Client = global.prismaWeb2Client;
  prismaWeb3Client = global.prismaWeb3Client;
}

export { prismaWeb2Client, prismaWeb3Client };

// Prisma BigInt serialization
BigInt.prototype.toJSON = function () {
  return this.toString();
};
