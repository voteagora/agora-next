import { AlchemyProvider, JsonRpcProvider } from "ethers";

/**
 * Wraps an Ethers provider to log all RPC calls with timing
 */
export function createLoggingProvider(
  provider: AlchemyProvider | JsonRpcProvider,
  label: string = "Provider"
): AlchemyProvider | JsonRpcProvider {
  if (process.env.NODE_ENV !== "development") {
    return provider;
  }

  const originalSend = provider.send.bind(provider);

  provider.send = async function (method: string, params: Array<any>) {
    const start = performance.now();
    const callId = Math.random().toString(36).substring(7);

    console.log(`[${label}:${callId}] 🔵 RPC CALL: ${method}`, {
      params: params.length > 0 ? params : undefined,
    });

    try {
      const result = await originalSend(method, params);
      const duration = performance.now() - start;

      console.log(
        `[${label}:${callId}] ✅ RPC DONE: ${method} (${duration.toFixed(2)}ms)`
      );

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(
        `[${label}:${callId}] ❌ RPC ERROR: ${method} (${duration.toFixed(2)}ms)`,
        error
      );
      throw error;
    }
  };

  return provider;
}
