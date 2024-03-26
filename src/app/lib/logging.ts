import { trace, Span } from "@opentelemetry/api";
import { type NextRequest } from "next/server";
import { performance } from "perf_hooks";
import * as util from "util";

import { SERVICE_NAME } from "@/instrumentation";

// 'dev' is used in vercel dev and preview, both of which need to have coloring disabled
// for emission and ingestion of logs into datadog
const log_emission = process.env.NEXT_PUBLIC_AGORA_ENV === "prod" || process.env.NEXT_PUBLIC_AGORA_ENV === "dev";

const tracer = trace.getTracer(SERVICE_NAME);

const time_this = async <T>(
  fn: () => Promise<T>,
  log_fields: Record<string, any>
) => {
  const start = performance.now();
  try {
    return await fn();
  } catch (error) {
    throw error;
  } finally {
    const end = performance.now();
    console.log(
      util.inspect(
        { ...log_fields, time: end - start },
        { showHidden: false, depth: null, colors: !log_emission }
      )
    );
  }
};

const time_this_sync = <T>(
  fn: () => T,
  log_fields: Record<string, any>
) => {
  const start = performance.now();
  try {
    return fn();
  } catch (error) {
    throw error;
  } finally {
    const end = performance.now();
    console.log(
      util.inspect(
        { ...log_fields, time: end - start },
        { showHidden: false, depth: null, colors: !log_emission }
      )
    );
  }
};

export const setCurrentSpanAttributes = <T>(
  span_attrs: Record<string, any>
) => {
  const span = trace.getActiveSpan() as Span;
  span.setAttributes(span_attrs);
}

export { time_this, time_this_sync };
