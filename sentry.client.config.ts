// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const DSN =
  "https://0dfeb56c16562e37267f25b351d6b0b4@o4504161740718080.ingest.us.sentry.io/4509164749193216";

console.log("Initializing Sentry with DSN:", DSN);

// Custom transport factory to bypass ad blockers
const createProxyTransport = (options: any) => {
  // Create the default transport as fallback
  const defaultTransport = Sentry.makeFetchTransport(options);

  return {
    send: async (event: any) => {
      try {
        console.log("Sending event via proxy:", event);

        const response = await fetch("/api/sentry-proxy", {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=UTF-8",
          },
          body: event,
        });

        console.log("Proxy response status:", response.status);

        // Return a properly typed response
        return {
          status: response.status === 200 ? "success" : "failed",
        };
      } catch (error) {
        console.error("Error sending to Sentry proxy:", error);
        // Fallback to default transport if proxy fails
        return defaultTransport.send(event);
      }
    },
    flush: (timeout?: number) => {
      return defaultTransport.flush(timeout);
    },
  } as any;
};

Sentry.init({
  dsn: DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NEXT_PUBLIC_AGORA_ENV || "development",
  debug: true,
  transport: createProxyTransport as any,
  tunnel: "/api/sentry-proxy",
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
