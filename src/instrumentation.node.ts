import { NodeSDK } from "@opentelemetry/sdk-node";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { Resource } from "@opentelemetry/resources";
import {
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
  SEMRESATTRS_SERVICE_NAME,
} from "@opentelemetry/semantic-conventions";

import { SERVICE_NAME } from "./instrumentation";

// NOTE: this instrumentation code will not run on the Vercel edge
const sdk = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: SERVICE_NAME,
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: process.env.VERCEL_ENV,
    "node.env": process.env.NODE_ENV,
    "vercel.env": process.env.VERCEL_ENV,
    "vercel.region": process.env.VERCEL_REGION,
    "vercel.runtime": process.env.NEXT_RUNTIME,
    "vercel.sha": process.env.VERCEL_GIT_COMMIT_SHA,
    "vercel.host": process.env.VERCEL_URL,
    "vercel.branch_host": process.env.VERCEL_BRANCH_URL,
  }),
  traceExporter: new OTLPTraceExporter(),
  // @ts-ignore - Type compatibility issue with OpenTelemetry versions
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
  }),
  // @ts-ignore
  spanProcessors: [new SimpleSpanProcessor(new OTLPTraceExporter())],
});
sdk.start();
