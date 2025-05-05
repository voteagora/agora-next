import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://0dfeb56c16562e37267f25b351d6b0b4@o4504161740718080.ingest.us.sentry.io/4509164749193216",
  tracesSampleRate: 1.0,
  environment: process.env.NEXT_PUBLIC_AGORA_ENV || "development",
  debug: true, // Enable debug to see what's happening
  // Add this custom transport to bypass ad blockers
  transport: (options) => {
    const defaultTransport = Sentry.makeFetchTransport(options);
    return {
      send: async (event) => {
        try {
          console.log("Sending event via proxy:", event);
          // Use your own domain instead of Sentry's
          const response = await fetch("/api/sentry-proxy", {
            method: "POST",
            headers: {
              "Content-Type": "text/plain;charset=UTF-8",
            },
            body: event,
          });

          console.log("Proxy response status:", response.status);
          return {
            status: response.status === 200 ? "success" : "failed",
          };
        } catch (error) {
          console.error("Error sending to Sentry proxy:", error);
          // Fallback to default transport if proxy fails
          return defaultTransport.send(event);
        }
      },
      flush: (timeout) => defaultTransport.flush(timeout),
    };
  },
  // Enable performance monitoring
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  // Capture 100% of transactions for performance monitoring
  // Adjust this value in production
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
