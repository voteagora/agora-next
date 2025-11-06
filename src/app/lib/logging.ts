import * as otel from "@opentelemetry/api";
import { performance } from "perf_hooks";
import * as util from "util";

import { SERVICE_NAME } from "@/instrumentation";

// 'dev' is used in vercel dev and preview, both of which need to have coloring disabled
// for emission and ingestion of logs into datadog
const log_emission =
  process.env.NEXT_PUBLIC_AGORA_ENV === "prod" ||
  process.env.NEXT_PUBLIC_AGORA_ENV === "dev";

export const OTEL_API_TRACER = otel.trace.getTracer(SERVICE_NAME);

export const time_this = async <T>(
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
    if (!process.env.NEXT_PUBLIC_MUTE_QUERY_LOGGING) {
      console.log(
        util.inspect(
          { ...log_fields, time: end - start },
          { showHidden: false, depth: null, colors: !log_emission }
        )
      );
    }
  }
};

export const time_this_sync = <T>(
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
    if (!process.env.NEXT_PUBLIC_MUTE_QUERY_LOGGING) {
      console.log(
        util.inspect(
          { ...log_fields, time: end - start },
          { showHidden: false, depth: null, colors: !log_emission }
        )
      );
    }
  }
};

/*
  Adds baggage to active context.
  OTel contexts are immutable; as such, we create a create context with the added baggage.
*/
export const addBaggage = (
  baggageToAdd: Record<string, string> | undefined
): otel.Context => {
  let ctxt: otel.Context;
  if (baggageToAdd) {
    let baggage =
      otel.propagation.getBaggage(otel.context.active()) ||
      otel.propagation.createBaggage();
    Object.entries(baggageToAdd).forEach(([key, value]) => {
      baggage = baggage.setEntry(key, { value: value });
    });
    ctxt = otel.propagation.setBaggage(otel.context.active(), baggage);
  } else {
    ctxt = otel.context.active();
  }
  return ctxt;
};

/*
  Adds span attributes to the supplied span, or the active span if none is supplied.
  No-op if there is no span supplied or if there is not an active span.
*/
export const addSpanAttributes = (
  span_attrs: Record<string, any>,
  span: otel.Span | null = null
) => {
  const chosenSpan = span || otel.trace.getActiveSpan();
  if (chosenSpan) {
    chosenSpan.setAttributes(span_attrs);
    otel.trace.setSpan(otel.context.active(), chosenSpan);
  }
};

/*
  Runs supplied function within a span specified by the metadata.
  If no tracer is supplied, uses the global tracer to create a span.
  Adds all baggage in context as span attributes, including additional baggage.
*/
export const doInSpan = <T>(
  metadata: {
    name: string;
    tracer?: otel.Tracer;
    additionalBaggage?: Record<string, string>;
  },
  fn: () => T
): T | Promise<T> => {
  const { tracer, name } = metadata;
  let selectedTracer: otel.Tracer;
  if (!tracer) {
    selectedTracer = OTEL_API_TRACER;
  } else {
    selectedTracer = tracer;
  }

  const newCtxt = addBaggage(metadata.additionalBaggage);

  const startAndRunInSpan = () =>
    selectedTracer.startActiveSpan(name, (span) => {
      const handleSuccess = (response: T) => {
        span.setStatus({ code: otel.SpanStatusCode.OK });
        span.end();
        return response;
      };

      const catchError = (error: otel.Exception) => {
        span.recordException(error);
        span.setStatus({ code: otel.SpanStatusCode.ERROR });
        span.end();
        throw error;
      };

      // unpack baggage and add to span attributes
      const baggage = otel.propagation.getBaggage(otel.context.active());
      if (baggage) {
        baggage.getAllEntries().forEach(([key, bag]) => {
          span.setAttribute(key, bag.value);
        });
      }

      try {
        const response = fn();
        if (response instanceof Promise) {
          return response.then(handleSuccess, catchError);
        }
        return handleSuccess(response);
      } catch (error) {
        catchError(error as otel.Exception);
        throw error;
      }
    });

  if (newCtxt) {
    return otel.context.with(newCtxt, startAndRunInSpan);
  } else {
    return startAndRunInSpan();
  }
};
