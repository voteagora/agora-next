import { PrismaClient } from "@prisma/client";
import { time_this } from "@/app/lib/logging";

declare global {
  var prismaWeb2Client: PrismaClient;
  var prismaWeb3Client: PrismaClient;
}

// Temporarily hardcode the suffix for testing
const envSuffix = "DEV";
console.log("Looking for:", `READ_WRITE_WEB2_DATABASE_URL_${envSuffix}`);
console.log("Looking for:", `READ_ONLY_WEB3_DATABASE_URL_${envSuffix}`);

// Log whether each variable exists (without revealing values)
console.log(
  "Web2 URL exists:",
  !!process.env[`READ_WRITE_WEB2_DATABASE_URL_${envSuffix}`]
);
console.log(
  "Web3 URL exists:",
  !!process.env[`READ_ONLY_WEB3_DATABASE_URL_${envSuffix}`]
);

const isProd = process.env.NEXT_PUBLIC_AGORA_ENV === "prod";
// const envSuffix = isProd ? "PROD" : "DEV";
console.log("Env Suffix: " + envSuffix);

// Add these lines to see the actual values (length only for security)
console.log(
  "Web2 URL type:",
  typeof process.env[`READ_WRITE_WEB2_DATABASE_URL_${envSuffix}`]
);
console.log(
  "Web3 URL type:",
  typeof process.env[`READ_ONLY_WEB3_DATABASE_URL_${envSuffix}`]
);
console.log(
  "Web2 URL length:",
  process.env[`READ_WRITE_WEB2_DATABASE_URL_${envSuffix}`]?.length || 0
);
console.log(
  "Web3 URL length:",
  process.env[`READ_ONLY_WEB3_DATABASE_URL_${envSuffix}`]?.length || 0
);

const readWriteWeb2Url =
  process.env[`READ_WRITE_WEB2_DATABASE_URL_${envSuffix}`];
const readOnlyWeb3Url = process.env[`READ_ONLY_WEB3_DATABASE_URL_${envSuffix}`];

// Log the variables after assignment
console.log("readWriteWeb2Url type:", typeof readWriteWeb2Url);
console.log("readOnlyWeb3Url type:", typeof readOnlyWeb3Url);
console.log("readWriteWeb2Url exists:", !!readWriteWeb2Url);
console.log("readOnlyWeb3Url exists:", !!readOnlyWeb3Url);

let prismaWeb2Client: PrismaClient;
let prismaWeb3Client: PrismaClient;

// Logging middleware
const makePrismaClient = (databaseUrl: string) => {
  const execRaw = async (
    query: (args: any) => Promise<any>,
    args: any,
    operation: string
  ) => {
    return await time_this(async () => await query(args), {
      operation,
      args,
    });
  };
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  }).$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }) {
          return await time_this(async () => await query(args), {
            model,
            operation,
            args,
          });
        },
      },
      async $queryRaw({ args, query, operation }) {
        return await execRaw(query, args, operation);
      },
      async $executeRaw({ args, query, operation }) {
        return await execRaw(query, args, operation);
      },
      async $queryRawUnsafe({ args, query, operation }) {
        return await execRaw(query, args, operation);
      },
      async $executeRawUnsafe({ args, query, operation }) {
        return await execRaw(query, args, operation);
      },
    },
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
    console.log("web 2 url state: " + !readWriteWeb2Url);
    console.log("web 3 url state: " + !readOnlyWeb3Url);
    console.log(readWriteWeb2Url);
    console.log(readOnlyWeb3Url);
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
