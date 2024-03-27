import { registerOTel, OTLPHttpJsonTraceExporter } from "@vercel/otel";
import {
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-node";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import {
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";

export const SERVICE_NAME = 'agora-app';

export async function register() {
  registerOTel({
    serviceName: SERVICE_NAME,
    spanProcessors: [
      new SimpleSpanProcessor(
        new OTLPHttpJsonTraceExporter()
      )
    ],
    traceExporter: new OTLPHttpJsonTraceExporter()
  });
}

