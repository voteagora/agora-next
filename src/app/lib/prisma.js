// Define and export a new Prisma client instance
// every time the function is called in development
// or use the global instance in production
import { PrismaClient } from "@prisma/client";

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
