import "server-only";

import { Client as MiradorServerClient } from "@miradorlabs/nodejs-sdk";

let miradorServerClient: MiradorServerClient | null = null;
let hasWarnedMissingServerApiKey = false;

export function getMiradorServerClient(): MiradorServerClient | null {
  if (process.env.NEXT_PUBLIC_MIRADOR_ENABLED === "false") {
    return null;
  }

  const apiKey = process.env.MIRADOR_SERVER_API_KEY;

  if (!apiKey) {
    if (!hasWarnedMissingServerApiKey) {
      hasWarnedMissingServerApiKey = true;
      console.warn(
        "MIRADOR_SERVER_API_KEY is not configured; server-side Mirador events are disabled."
      );
    }
    return null;
  }

  if (!miradorServerClient) {
    try {
      miradorServerClient = new MiradorServerClient(apiKey);
    } catch (error) {
      console.error("Failed to initialize Mirador server client", error);
      miradorServerClient = null;
    }
  }

  return miradorServerClient;
}
