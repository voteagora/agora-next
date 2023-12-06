import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

// Logging middleware
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();

  return result;
});

export default prisma;

// Prisma BigInt serialization
BigInt.prototype.toJSON = function () {
  return this.toString();
};
