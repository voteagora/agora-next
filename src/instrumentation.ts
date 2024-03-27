import { registerOTel } from "@vercel/otel";
import {
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import {
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";

export const SERVICE_NAME = 'agora-app';

export async function register() {
  registerOTel({
    serviceName: SERVICE_NAME,
    traceExporter: new OTLPTraceExporter(),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
    }),
    spanProcessors: [
      new SimpleSpanProcessor(
        new OTLPTraceExporter()
      )
    ], 
  });
}

