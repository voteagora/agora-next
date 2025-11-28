// lib/prisma/web2.ts

import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

type AcceleratedClient = ReturnType<
  PrismaClient['$extends']
>; // This produces the correct extended type

const globalForWeb2 = globalThis as unknown as {
  web2Prisma?: AcceleratedClient;
};

export const prismaWeb2Client =
  globalForWeb2.web2Prisma ??
  new PrismaClient().$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") {
  globalForWeb2.web2Prisma = prismaWeb2Client;
}
