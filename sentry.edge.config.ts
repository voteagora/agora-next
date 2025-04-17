// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://0dfeb56c16562e37267f25b351d6b0b4@o4504161740718080.ingest.us.sentry.io/4509164749193216",
  tracesSampleRate: 1,
  environment: "development",
  debug: true,
});
