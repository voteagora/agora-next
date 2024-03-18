import { performance } from "perf_hooks";
import * as util from "util";

const prod = process.env.NODE_ENV === "production";

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
        { showHidden: false, depth: null, colors: !prod }
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
        { showHidden: false, depth: null, colors: !prod }
      )
    );
  }
};

export { time_this, time_this_sync };
