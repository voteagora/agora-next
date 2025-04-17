import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://0dfeb56c16562e37267f25b351d6b0b4@o4504161740718080.ingest.us.sentry.io/4509164749193216",
  tracesSampleRate: 1.0,
  environment: process.env.NEXT_PUBLIC_AGORA_ENV || "development",
});
