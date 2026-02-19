type LogEntry = {
  tool: string;
  args: Record<string, unknown>;
  timestamp: string;
  tenantNamespace: string;
  durationMs?: number;
  error?: string;
};

export function logToolInvocation(entry: LogEntry): void {
  console.info("[WebMCP]", JSON.stringify(entry));
}

export function createTimedLogger(
  tool: string,
  args: Record<string, unknown>,
  tenantNamespace: string
): { finish: (error?: string) => void } {
  const start = performance.now();

  return {
    finish(error?: string) {
      logToolInvocation({
        tool,
        args,
        timestamp: new Date().toISOString(),
        tenantNamespace,
        durationMs: Math.round(performance.now() - start),
        ...(error ? { error } : {}),
      });
    },
  };
}
