/**
 * Temporary, verbose diagnostics for the Privy login / wagmi sync flow.
 *
 * Every event is written to the browser console with a `[privy-debug]` prefix,
 * kept in `window.__privyDebugLog`, and shipped in batches to
 * `/api/privy-debug-log`, which echoes it into the server logs so the whole
 * sequence (including what happens right before an OAuth redirect) can be
 * read from the deployment's logs.
 */

const PREFIX = "[privy-debug]";
const ENDPOINT = "/api/privy-debug-log";
const FLUSH_INTERVAL_MS = 1_000;
const MAX_BUFFER = 1_000;
const MAX_BATCH = 50;

type Json = Record<string, unknown>;

declare global {
  interface Window {
    __privyDebugLog?: Json[];
    __privyDebugDump?: () => string;
  }
}

let seq = 0;
let queue: Json[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let listenersInstalled = false;
let enabled: boolean | null = null;

const sessionId =
  typeof window === "undefined"
    ? "server"
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function isEnabled() {
  if (enabled !== null) return enabled;
  try {
    // lazy so importing this module never touches tenant config at import time
    const Tenant = require("@/lib/tenant/tenant").default;
    enabled = Tenant.current().ui.toggle("privy-login")?.enabled === true;
  } catch {
    enabled = false;
  }
  return enabled;
}

export function serializeError(error: unknown): Json {
  if (error instanceof Error) {
    const anyError = error as Error & Record<string, unknown>;
    return {
      name: error.name,
      message: error.message,
      code: anyError.code,
      privyErrorCode: anyError.privyErrorCode,
      cause:
        anyError.cause instanceof Error
          ? { name: anyError.cause.name, message: anyError.cause.message }
          : anyError.cause,
      stack: error.stack?.split("\n").slice(0, 6).join("\n"),
    };
  }
  if (typeof error === "object" && error !== null) {
    try {
      return { value: JSON.parse(safeStringify(error)) };
    } catch {
      return { value: String(error) };
    }
  }
  return { value: String(error) };
}

function safeStringify(value: unknown) {
  const seen = new WeakSet<object>();
  return JSON.stringify(value, (_key, v) => {
    if (typeof v === "bigint") return `${v.toString()}n`;
    if (typeof v === "function") return `[fn ${v.name || "anonymous"}]`;
    if (v instanceof Error) return serializeError(v);
    if (typeof v === "object" && v !== null) {
      if (seen.has(v)) return "[circular]";
      seen.add(v);
    }
    return v;
  });
}

function sanitize(data?: Json): Json {
  if (!data) return {};
  try {
    return JSON.parse(safeStringify(data));
  } catch (error) {
    return { unserializable: String(error) };
  }
}

function send(entries: Json[], useBeacon: boolean) {
  if (!entries.length) return;
  const body = JSON.stringify({ entries });
  try {
    if (useBeacon && typeof navigator?.sendBeacon === "function") {
      navigator.sendBeacon(
        ENDPOINT,
        new Blob([body], { type: "application/json" })
      );
      return;
    }
    void fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // diagnostics must never break the app
  }
}

export function flushPrivyDebugLog(useBeacon = false) {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  while (queue.length) {
    const batch = queue.splice(0, MAX_BATCH);
    send(batch, useBeacon);
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushPrivyDebugLog(false);
  }, FLUSH_INTERVAL_MS);
}

function installListeners() {
  if (listenersInstalled || typeof window === "undefined") return;
  listenersInstalled = true;
  window.__privyDebugLog = window.__privyDebugLog ?? [];
  window.__privyDebugDump = () =>
    JSON.stringify(window.__privyDebugLog ?? [], null, 2);
  // flush synchronously before an OAuth redirect / reload takes the page away
  window.addEventListener("pagehide", () => {
    privyDebugLog("page_hide", { href: redactHref(window.location.href) });
    flushPrivyDebugLog(true);
  });
  document.addEventListener("visibilitychange", () => {
    privyDebugLog("visibility_change", { state: document.visibilityState });
    if (document.visibilityState === "hidden") flushPrivyDebugLog(true);
  });
  window.addEventListener("unhandledrejection", (event) => {
    privyDebugLog("window_unhandledrejection", {
      reason: serializeError(event.reason),
    });
  });
  window.addEventListener("error", (event) => {
    privyDebugLog("window_error", {
      message: event.message,
      source: `${event.filename}:${event.lineno}:${event.colno}`,
      error: serializeError(event.error),
    });
  });
}

/** Keeps the path and the query-param *names* (OAuth codes/states are secrets). */
export function redactHref(href: string) {
  try {
    const url = new URL(href);
    const params = Array.from(url.searchParams.keys());
    return `${url.origin}${url.pathname}${params.length ? `?${params.join("&")}` : ""}${url.hash ? "#…" : ""}`;
  } catch {
    return "[unparseable]";
  }
}

export function privyDebugLog(event: string, data?: Json) {
  if (typeof window === "undefined" || !isEnabled()) return;
  installListeners();
  const entry: Json = {
    seq: ++seq,
    t: new Date().toISOString(),
    sinceLoadMs: Math.round(performance.now()),
    session: sessionId,
    event,
    ...sanitize(data),
  };
  console.log(PREFIX, event, entry);
  const buffer = window.__privyDebugLog!;
  buffer.push(entry);
  if (buffer.length > MAX_BUFFER) buffer.splice(0, buffer.length - MAX_BUFFER);
  queue.push(entry);
  if (queue.length >= MAX_BATCH) flushPrivyDebugLog(false);
  else scheduleFlush();
}

/**
 * Snapshot of the persisted wagmi / Privy keys that drive reconnect decisions.
 * Privy values are never logged (they include tokens); only key names + sizes.
 */
export function snapshotPrivyStorage(): Json {
  if (typeof window === "undefined") return {};
  const wagmi: Json = {};
  const privyKeys: Json = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const value = localStorage.getItem(key) ?? "";
      if (key.startsWith("wagmi.")) {
        if (key === "wagmi.store") {
          try {
            const parsed = JSON.parse(value);
            wagmi[key] = {
              status: parsed?.state?.status,
              chainId: parsed?.state?.chainId,
              current: parsed?.state?.current,
              connections: parsed?.state?.connections?.value?.map?.(
                ([uid, c]: [string, any]) => ({
                  uid,
                  connectorId: c?.connector?.id,
                  accounts: c?.accounts,
                  chainId: c?.chainId,
                })
              ),
            };
          } catch {
            wagmi[key] = value.slice(0, 200);
          }
        } else {
          wagmi[key] = value.slice(0, 200);
        }
      } else if (key.startsWith("privy")) {
        privyKeys[key] = { length: value.length };
      }
    }
  } catch (error) {
    return { storageError: serializeError(error) };
  }
  return { wagmi, privyKeys };
}

export function summarizePrivyUser(user: any) {
  if (!user) return null;
  return {
    id: user.id,
    createdAt: user.createdAt,
    isGuest: user.isGuest,
    hasAcceptedTerms: user.hasAcceptedTerms,
    linkedAccounts: (user.linkedAccounts ?? []).map((account: any) => ({
      type: account.type,
      address: account.address,
      chainType: account.chainType,
      walletClientType: account.walletClientType,
      connectorType: account.connectorType,
      walletIndex: account.walletIndex,
      delegated: account.delegated,
      imported: account.imported,
      verifiedAt: account.verifiedAt,
      latestVerifiedAt: account.latestVerifiedAt,
      firstVerifiedAt: account.firstVerifiedAt,
    })),
    wallet: user.wallet
      ? {
          address: user.wallet.address,
          walletClientType: user.wallet.walletClientType,
          connectorType: user.wallet.connectorType,
          chainType: user.wallet.chainType,
        }
      : null,
    email: user.email ? { present: true } : null,
    google: user.google ? { present: true } : null,
  };
}

export function summarizePrivyWallet(wallet: any) {
  if (!wallet) return null;
  return {
    address: wallet.address,
    type: wallet.type,
    chainId: wallet.chainId,
    walletClientType: wallet.walletClientType,
    connectorType: wallet.connectorType,
    imported: wallet.imported,
    connectedAt: wallet.connectedAt,
    meta: wallet.meta
      ? { id: wallet.meta.id, name: wallet.meta.name }
      : undefined,
  };
}

export function summarizeWagmiConfig(config: any) {
  if (!config) return null;
  let state: any = {};
  try {
    state = config.state ?? {};
  } catch {}
  return {
    status: state.status,
    chainId: state.chainId,
    current: state.current,
    connections: Array.from(
      (state.connections as Map<string, any> | undefined)?.values?.() ?? []
    ).map((connection: any) => ({
      uid: connection?.connector?.uid,
      connectorId: connection?.connector?.id,
      accounts: connection?.accounts,
      chainId: connection?.chainId,
    })),
    connectors: (config.connectors ?? []).map((connector: any) => ({
      id: connector.id,
      uid: connector.uid,
      name: connector.name,
      type: connector.type,
    })),
    chains: (config.chains ?? []).map((chain: any) => chain.id),
  };
}

/** Which wagmi connectors currently report this address, via eth_accounts. */
export async function probeWagmiConnectorsForAddress(
  config: any,
  address: string
) {
  const target = address.toLowerCase();
  const results: Json[] = [];
  for (const connector of config?.connectors ?? []) {
    const started = performance.now();
    try {
      const accounts: string[] = await Promise.race([
        connector.getAccounts(),
        new Promise<string[]>((_, reject) =>
          setTimeout(() => reject(new Error("getAccounts timeout 5s")), 5_000)
        ),
      ]);
      results.push({
        id: connector.id,
        accounts,
        matches: accounts.some((a) => a.toLowerCase() === target),
        ms: Math.round(performance.now() - started),
      });
    } catch (error) {
      results.push({
        id: connector.id,
        error: serializeError(error),
        ms: Math.round(performance.now() - started),
      });
    }
  }
  return results;
}
