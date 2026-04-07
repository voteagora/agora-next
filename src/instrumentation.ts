import { registerOTel } from "@vercel/otel";

export const SERVICE_NAME = "agora-app";

export async function register() {
  if (
    process.env.ENABLE_E2E_MOCKS === "true" &&
    process.env.NEXT_RUNTIME === "nodejs"
  ) {
    // Set mock Prisma globals BEFORE prisma.ts is imported by any page module.
    // prisma.ts checks `if (!global.prismaWeb2Client)` — by setting it here
    // first, it skips real DB initialization and uses our mock instead.
    const { createMockPrismaClient } = await import("../tests/mocks/prisma");
    const mockClient = createMockPrismaClient();
    (global as any).prismaWeb2Client = mockClient;
    (global as any).prismaWeb3Client = mockClient;
    console.log("[Prisma] Mock client installed for E2E testing");

    const { server } = await import("../tests/mocks/server");
    server.listen({ onUnhandledRequest: "bypass" });
    console.log("[MSW] Mock server started for E2E testing");
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation.node");
  } else {
    registerOTel({
      serviceName: SERVICE_NAME,
      attributes: {
        "deployment.environment": process.env.VERCEL_ENV,
        "vercel.env": process.env.VERCEL_ENV,
        "node.env": process.env.NODE_ENV,
        "vercel.region": process.env.VERCEL_REGION,
        "vercel.runtime": process.env.NEXT_RUNTIME,
        "vercel.sha": process.env.VERCEL_GIT_COMMIT_SHA,
        "vercel.host": process.env.VERCEL_URL,
        "vercel.branch_host": process.env.VERCEL_BRANCH_URL,
      },
    });
  }
}
