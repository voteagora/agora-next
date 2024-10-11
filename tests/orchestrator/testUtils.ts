import { loadConfig } from "./loadTestConfig";
import prisma from "@/app/lib/prisma";
import { Config } from "../test.types";

export async function setupTestDatabase() {
  const config: Config = loadConfig() as Config;
  const tenantEnv = config.tenants[0].env;
  const { DATABASE_URL, NEXT_PUBLIC_AGORA_INSTANCE_NAME } =
    tenantEnv as unknown as {
      DATABASE_URL: string;
      NEXT_PUBLIC_AGORA_INSTANCE_NAME: string;
    };

  if (!DATABASE_URL || !NEXT_PUBLIC_AGORA_INSTANCE_NAME) {
    throw new Error(
      "Missing required environment variables in tenant configuration"
    );
  }

  try {
    await prisma.$connect();
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
}

export async function teardownTestDatabase() {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error("Error disconnecting from the database:", error);
    throw error;
  }
}
