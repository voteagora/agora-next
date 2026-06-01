import { PrismaClient, type Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE === "phase-production-build") {
//   throw new Error("🚨 Prisma query during build!");
// }

declare global {
  var prismaClient: PrismaClient | undefined;
}

const databaseUrl = process.env.DATABASE_URL;

// Allows tuning connection pool size without code changes
const configuredPoolMax = Number(process.env.PG_ADAPTER_POOL_MAX ?? "5");
const POOL_MAX = Number.isFinite(configuredPoolMax) ? configuredPoolMax : 5;
const CONNECTION_TIMEOUT_MS = 10000;
const MAX_READ_RETRIES = 2;
const RETRYABLE_READ_ACTIONS = new Set<Prisma.PrismaAction>([
  "findUnique",
  "findUniqueOrThrow",
  "findMany",
  "findFirst",
  "findFirstOrThrow",
  "aggregate",
  "count",
  "groupBy",
]);

const rawSql = (args: unknown) => {
  const firstArg = Array.isArray(args) ? args[0] : args;
  if (typeof firstArg === "string") {
    return firstArg;
  }

  if (firstArg && typeof firstArg === "object" && "sql" in firstArg) {
    const sql = firstArg.sql;
    return typeof sql === "string" ? sql : "";
  }

  return "";
};

const isReadOnlyRawQuery = (args: unknown) => {
  const query = rawSql(args);
  return (
    /^\s*(select|show|explain)\b/i.test(query) ||
    (/^\s*with\b/i.test(query) &&
      !/\b(insert|update|delete|merge|create|alter|drop|truncate)\b/i.test(
        query
      ))
  );
};

const isRetryableRead = (params: Prisma.MiddlewareParams) => {
  return (
    !params.runInTransaction &&
    (RETRYABLE_READ_ACTIONS.has(params.action) ||
      (params.action === "queryRaw" && isReadOnlyRawQuery(params.args)))
  );
};

const isConnectionError = (error: unknown) => {
  const errorWithDetails = error as {
    code?: unknown;
    cause?: unknown;
  };
  const code =
    typeof errorWithDetails.code === "string" ? errorWithDetails.code : "";
  const message = error instanceof Error ? error.message : String(error);
  const cause =
    errorWithDetails.cause instanceof Error
      ? errorWithDetails.cause.message
      : "";
  const text = `${message} ${cause}`;

  return (
    ["P1001", "P1002", "P2024"].includes(code) ||
    /timeout exceeded when trying to connect|connection terminated|can't reach database server|econnreset|etimedout/i.test(
      text
    )
  );
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const retryReadMiddleware: Prisma.Middleware = async (params, next) => {
  if (!isRetryableRead(params)) {
    return next(params);
  }

  for (let attempt = 0; attempt <= MAX_READ_RETRIES; attempt++) {
    try {
      return await next(params);
    } catch (error) {
      if (attempt === MAX_READ_RETRIES || !isConnectionError(error)) {
        throw error;
      }

      await sleep(75 + Math.floor(Math.random() * 125));
    }
  }
};

const makePrismaClient = (databaseUrl: string) => {
  const pool = new Pool({
    connectionString: databaseUrl,
    max: POOL_MAX,
    connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
  });

  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
  });

  const client = new PrismaClient({
    adapter: new PrismaPg(pool),
  });

  client.$use(retryReadMiddleware);

  return client;
};

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

const prismaClient =
  process.env.NODE_ENV === "production"
    ? makePrismaClient(databaseUrl)
    : (global.prismaClient ??= makePrismaClient(databaseUrl));

const prismaWeb2Client = prismaClient;
const prismaWeb3Client = prismaClient;

export { prismaWeb2Client, prismaWeb3Client };

// Prisma BigInt serialization
(BigInt.prototype as BigInt & { toJSON(): string }).toJSON = function () {
  return this.toString();
};
