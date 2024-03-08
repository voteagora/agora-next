async function time_this<T>(func: () => Promise<T> | T, fn_name: string | null): Promise<T> {
  const startTime = performance.now();

  try {
    return await func();
  } catch (error) {
    throw error; // Rethrow error after logging it
  } finally {
    const endTime = performance.now();
    const duration = endTime - startTime;
    if (fn_name) {
      console.log(`${fn_name}: took ${duration}ms`);
    } else {
      console.log(`took ${duration}ms`);
    }
  }
}

function time_this_sync<T>(func: () => T, fn_name: string | null): T {
  const startTime = performance.now();

  try {
    return func();
  } catch (error) {
    throw error; // Rethrow error after logging it
  } finally {
    const endTime = performance.now();
    const duration = endTime - startTime;
    if (fn_name) {
      console.log(`${fn_name}: took ${duration}ms`);
    } else {
      console.log(`took ${duration}ms`);
    }
  }
}

export { time_this, time_this_sync };