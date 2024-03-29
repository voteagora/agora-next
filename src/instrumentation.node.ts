import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from "@opentelemetry/sdk-trace-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from "@opentelemetry/sdk-metrics";
import { Resource } from "@opentelemetry/resources";
import { SEMRESATTRS_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

import { SERVICE_NAME } from "./instrumentation";
// TODO: Use OTLP exporter when we have a supported metrics collector or OTLP endpoint
// import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'

// NOTE: this instrumentation code will not run on the Vercel edge
const sdk = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: SERVICE_NAME,
  }),
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
  spanProcessor: new SimpleSpanProcessor(new ConsoleSpanExporter()),
  // instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
