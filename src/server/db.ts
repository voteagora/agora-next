/**
 * Prisma Client for RBAC services
 * Uses the same prismaWeb2Client from app/lib/prisma
 */

import { prismaWeb2Client } from "@/app/lib/prisma";

// Export with a cleaner name for RBAC services
export const db = prismaWeb2Client;
