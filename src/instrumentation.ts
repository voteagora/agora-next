import { registerOTel } from "@vercel/otel";
import * as Sentry from "@sentry/nextjs";

export const SERVICE_NAME = "agora-app";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation.node");
    await import("../sentry.server.config");
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

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
