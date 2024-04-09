import { PrismaClient } from "@prisma/client";
import { time_this } from "@/app/lib/logging";

declare global {
  var prisma: PrismaClient;
}

let prisma: PrismaClient;

// Logging middleware
const makePrismaClient = () => {
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
  return new PrismaClient().$extends({
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
  prisma = makePrismaClient() as PrismaClient;
} else {
  if (!global.prisma) {
    global.prisma = makePrismaClient() as PrismaClient;
  }
  prisma = global.prisma;
}

export default prisma;

// Prisma BigInt serialization
BigInt.prototype.toJSON = function () {
  return this.toString();
};
