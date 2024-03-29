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
  registerOTel(SERVICE_NAME);
}

