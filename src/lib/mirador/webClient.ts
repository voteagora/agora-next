"use client";

import {
  Client as MiradorWebClient,
  Web3Plugin,
} from "@miradorlabs/web-sdk/dist/index.esm.js";

let miradorClient: MiradorWebClient | null = null;
let configuredApiKey: string | null = null;

type ConfigureMiradorWebClientOptions = {
  apiKey?: string | null;
  enabled?: boolean;
};

export function configureMiradorWebClient({
  apiKey,
  enabled = false,
}: ConfigureMiradorWebClientOptions = {}) {
  if (!enabled || !apiKey) {
    miradorClient = null;
    configuredApiKey = null;
    return;
  }

  if (miradorClient && configuredApiKey === apiKey) {
    return;
  }

  try {
    miradorClient = new MiradorWebClient(apiKey, {
      plugins: [Web3Plugin()],
      callbacks: {
        onFlushError: (error) => {
          console.error("[mirador] web flush error", error);
        },
        onDropped: (count, reason) => {
          console.warn("[mirador] web trace dropped", { count, reason });
        },
      },
    });
    configuredApiKey = apiKey;
  } catch (error) {
    console.error("Failed to initialize Mirador web client", error);
    miradorClient = null;
    configuredApiKey = null;
  }
}

export function getMiradorWebClient(): MiradorWebClient | null {
  return miradorClient;
}
