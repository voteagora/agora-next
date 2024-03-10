import { performance } from "perf_hooks";
import * as util from "util";

const time_this = async <T>(
  fn: () => Promise<T>,
  log_fields: Record<string, any>
) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(
    util.inspect(
      { ...log_fields, time: end - start },
      { showHidden: false, depth: null, colors: true }
    )
  );
  return result;
};

const time_this_sync = <T>(
  fn: () => T,
  log_fields: Record<string, any>
) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(
    util.inspect(
      { ...log_fields, time: end - start },
      { showHidden: false, depth: null, colors: true }
    )
  );
  return result;
};

export { time_this, time_this_sync };
