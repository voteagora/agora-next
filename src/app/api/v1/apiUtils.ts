import * as log from "@/app/lib/logging";
import * as otel from "@opentelemetry/api";
import { SEMATTRS_ENDUSER_ID } from "@opentelemetry/semantic-conventions";

export const traceWithUserId = <T>(userId: string, fn: () => Promise<T>) => {
  // Get the active tracer
  const tracer = otel.trace.getTracer("agora-app");

  // Start a new span
  return tracer.startActiveSpan("my-span", async (span) => {
    try {
      // Set user ID as a span attribute
      span.setAttribute(SEMATTRS_ENDUSER_ID, userId);

      // Add baggage (context propagation)
      const baggage = otel.propagation.createBaggage({
        [SEMATTRS_ENDUSER_ID]: {
          value: userId,
        },
      });
      const contextWithBaggage = otel.propagation.setBaggage(
        otel.context.active(),
        baggage
      );

      // Execute the function within the context
      return await otel.context.with(contextWithBaggage, fn);
    } finally {
      // End the span
      span.end();
    }
  });
};
