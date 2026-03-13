"use client";

import { Client as MiradorWebClient } from "@miradorlabs/web-sdk/dist/index.esm.js";

let miradorClient: MiradorWebClient | null = null;
let configuredApiKey: string | null = null;

export function configureMiradorWebClient(apiKey?: string | null) {
  if (!apiKey) {
    return;
  }

  if (miradorClient && configuredApiKey === apiKey) {
    return;
  }

  try {
    miradorClient = new MiradorWebClient(apiKey);
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
