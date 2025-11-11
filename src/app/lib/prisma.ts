import { PrismaClient } from "@prisma/client";
import { time_this } from "@/app/lib/logging";

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
  const isProd = process.env.NEXT_PUBLIC_AGORA_ENV === "prod";
  envSuffix = isProd ? "PROD" : "DEV";
}

const resolveDbUrl = (type: "WEB2" | "WEB3") => {
  const databaseUrl = process.env.DATABASE_URL;

  // If DATABASE_URL is set but not to 'dev' or 'prod', use it directly for both clients
  if (databaseUrl && databaseUrl !== "dev" && databaseUrl !== "prod") {
    return databaseUrl;
  }

  return process.env[
    `${type === "WEB2" ? "READ_WRITE_WEB2" : "READ_ONLY_WEB3"}_DATABASE_URL_${envSuffix}`
  ];
};

const readWriteWeb2Url = resolveDbUrl("WEB2");
const readOnlyWeb3Url = resolveDbUrl("WEB3");

let prismaWeb2Client: PrismaClient;
let prismaWeb3Client: PrismaClient;

// Logging middleware
const makePrismaClient = (databaseUrl: string) => {
  const execRaw = async (
    query: (args: any) => Promise<any>,
    args: any,
    operation: string
  ) => {
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await time_this(async () => await query(args), {
          operation,
          args,
        });
      } catch (error) {
        lastError = error as Error;
        if (error instanceof Error && error.message.includes("P1017")) {
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            continue;
          }
        }
        throw error;
      }
    }
    throw lastError;
  };

  const client = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? [
            { level: "query", emit: "event" },
            { level: "error", emit: "stdout" },
            { level: "warn", emit: "stdout" },
          ]
        : ["error"],
  });

  // Attach query logging in development
  if (process.env.NODE_ENV === "development") {
    client.$on("query" as any, (e: any) => {
      console.log(
        `🗄️  [PRISMA QUERY] ${e.query.substring(0, 100)}... - ${e.duration}ms`
      );
      if (e.duration > 1000) {
        console.warn(`⚠️  [SLOW QUERY] took ${e.duration}ms`);
      }
    });
  }

  return client;
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
