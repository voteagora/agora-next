import * as log from "@/app/lib/logging";
import * as otel from "@opentelemetry/api";
import { SEMATTRS_ENDUSER_ID } from "@opentelemetry/semantic-conventions";

export const withUserId = <T>(userId: string, fn: () => Promise<T>) => {
  log.addSpanAttributes({ [SEMATTRS_ENDUSER_ID]: userId });
  // Next JS is instrumented with OTel, and as such, any API call will have
  // an active span and context. The below cast should be safe if used in an API route.
  const ctxt = log.addBaggage({
    [SEMATTRS_ENDUSER_ID]: userId as string,
  }) as otel.Context;
  return otel.context.with(ctxt, fn);
};
