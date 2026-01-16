import "server-only";

import type {
  ChannelConfig,
  ChannelConfigs,
  ChannelType,
  EmailVerificationInitResponse,
  EventTypesResponse,
  LinkingInitResponse,
  MeResponse,
  PreferenceState,
  PreferencesResponse,
  Recipient,
  RecipientType,
} from "./types";

export interface CreateRecipientInput {
  recipient_id: string;
  recipient_type: RecipientType;
  channels?: ChannelConfigs;
  attributes?: Record<string, unknown>;
}

export interface UpdateRecipientInput {
  recipient_type?: RecipientType;
  channels?: ChannelConfigs;
  attributes?: Record<string, unknown>;
}

export interface PreferenceUpdateEntry {
  state: PreferenceState;
}

export type PreferencesUpdate = Record<
  string,
  Record<ChannelType, PreferenceUpdateEntry>
>;

export interface SuccessResponse {
  success: boolean;
  message: string;
  recipient_id?: string;
}

export interface EventAcceptedResponse {
  message: string;
  event_id: string;
  status?: "pending" | "processing" | "completed" | "failed";
  status_url?: string;
  created?: boolean;
  summary?: Record<string, number>;
  results?: Array<Record<string, unknown>>;
}

export interface BatchCreateEventTypesResponse {
  success: boolean;
  message: string;
  created: number;
  errors?: string[];
}

export interface SendEventPayload {
  event_type: string;
  entity_id?: string;
  recipients: Array<{ recipient_id: string; channels: ChannelType[] }>;
  data: Record<string, unknown>;
  template_id?: string;
  priority?: "high" | "normal" | "low";
}

export interface BroadcastEventPayload {
  event_type: string;
  entity_id?: string;
  filter?: {
    attributes?: Record<string, unknown>;
    recipient_ids?: string[];
    recipient_type?: RecipientType;
    exclude_recipient_ids?: string[];
  };
  channels: ChannelType[];
  data: Record<string, unknown>;
  template_id?: string;
  priority?: "high" | "normal" | "low";
}

export type CompoundEventCandidatePayload =
  | {
      kind: "direct";
      event_type: string;
      entity_id?: string;
      recipients: Array<{ recipient_id: string; channels: ChannelType[] }>;
      data: Record<string, unknown>;
      template_id?: string;
      priority?: "high" | "normal" | "low";
    }
  | {
      kind: "broadcast";
      event_type: string;
      entity_id?: string;
      filter?: {
        attributes?: Record<string, unknown>;
        recipient_ids?: string[];
        recipient_type?: RecipientType;
        exclude_recipient_ids?: string[];
      };
      channels: ChannelType[];
      data: Record<string, unknown>;
      template_id?: string;
      priority?: "high" | "normal" | "low";
    };

export interface CompoundEventPayload {
  dedupe_group: string;
  dedupe_key: string;
  candidates: CompoundEventCandidatePayload[];
}

function getClientConfig() {
  const baseUrl = process.env.NOTIFICATION_CENTER_URL;
  const apiKey = process.env.NOTIFICATION_CENTER_API_KEY;

  if (!baseUrl) {
    throw new Error("NOTIFICATION_CENTER_URL is missing from env");
  }
  if (!apiKey) {
    throw new Error("NOTIFICATION_CENTER_API_KEY is missing from env");
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    apiKey,
  };
}

function buildUrl(path: string): string {
  const { baseUrl } = getClientConfig();
  const normalizedPath = path.startsWith("/v1")
    ? path
    : `/v1${path.startsWith("/") ? path : `/${path}`}`;
  return new URL(normalizedPath, baseUrl).toString();
}

type RequestRetryMode = "none" | "idempotent";

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRIES = 2;

type NoRetryError = Error & { __notificationCenterNoRetry?: true };

function makeNoRetryError(message: string): NoRetryError {
  const error = new Error(message) as NoRetryError;
  error.__notificationCenterNoRetry = true;
  return error;
}

function isNoRetryError(error: unknown): error is NoRetryError {
  return (
    !!error &&
    typeof error === "object" &&
    "__notificationCenterNoRetry" in error &&
    Boolean((error as NoRetryError).__notificationCenterNoRetry)
  );
}

function isRetryableStatus(status: number): boolean {
  return (
    status === 408 ||
    status === 425 ||
    status === 429 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

function isIdempotentMethod(method: string): boolean {
  return (
    method === "GET" ||
    method === "HEAD" ||
    method === "PUT" ||
    method === "DELETE"
  );
}

function isIdempotentRequest(method: string, headers: Headers): boolean {
  if (isIdempotentMethod(method)) return true;
  if (method === "POST") {
    return Boolean(headers.get("Idempotency-Key"));
  }
  return false;
}

function computeBackoffMs(attempt: number): number {
  const base = 250 * Math.pow(2, attempt);
  const jitter = Math.floor(Math.random() * 100);
  return base + jitter;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function readErrorBody(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const json = (await response.json()) as unknown;
      if (json && typeof json === "object") {
        const message = (json as any).message;
        if (typeof message === "string" && message.trim()) {
          return message;
        }
      }
      return JSON.stringify(json);
    }
  } catch {
    // fall back to text
  }

  try {
    return await response.text();
  } catch {
    return "";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  allowNotFound = false,
  retryMode: RequestRetryMode = "idempotent"
): Promise<T | null> {
  const { apiKey } = getClientConfig();
  const headers = new Headers(options.headers);

  headers.set("X-API-Key", apiKey);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const method = (options.method ?? "GET").toUpperCase();
  const resolvedRetryMode =
    retryMode === "idempotent" && isIdempotentRequest(method, headers)
      ? retryMode
      : "none";

  const timeoutMs = DEFAULT_TIMEOUT_MS;
  const maxRetries = resolvedRetryMode === "idempotent" ? DEFAULT_RETRIES : 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(buildUrl(path), {
        ...options,
        headers,
        cache: options.cache ?? "no-store",
        signal: controller.signal,
      });

      if (!response.ok) {
        if (allowNotFound && response.status === 404) {
          return null;
        }

        const shouldRetry =
          attempt < maxRetries && isRetryableStatus(response.status);

        const errorBody = await readErrorBody(response);
        if (!shouldRetry) {
          const details = errorBody ? ` - ${errorBody}` : "";
          throw makeNoRetryError(
            `Notification Center request failed (${response.status} ${response.statusText})${details}`
          );
        }

        await sleep(computeBackoffMs(attempt));
        continue;
      }

      if (response.status === 204) {
        return null;
      }

      return (await response.json()) as T;
    } catch (error) {
      const isAbort = error instanceof Error && error.name === "AbortError";
      const shouldRetry = attempt < maxRetries && !isNoRetryError(error);
      if (!shouldRetry) {
        const suffix = isAbort ? ` after ${timeoutMs}ms` : "";
        const message = error instanceof Error ? error.message : String(error);
        throw makeNoRetryError(
          `Notification Center request failed${suffix}: ${message}`
        );
      }

      await sleep(computeBackoffMs(attempt));
    } finally {
      clearTimeout(timeout);
    }
  }

  return null;
}

function jsonRequest<T>(
  path: string,
  method: string,
  body?: unknown,
  allowNotFound = false,
  retryMode?: RequestRetryMode,
  headers?: HeadersInit
): Promise<T | null> {
  return request<T>(
    path,
    {
      method,
      body: body ? JSON.stringify(body) : undefined,
      ...(headers ? { headers } : {}),
    },
    allowNotFound,
    retryMode
  );
}

export class NotificationCenterClient {
  async getMe(): Promise<MeResponse | null> {
    return request<MeResponse>("/me", { method: "GET" });
  }

  async getRecipient(recipientId: string): Promise<Recipient | null> {
    return request<Recipient>(
      `/recipients/${recipientId}`,
      { method: "GET" },
      true
    );
  }

  async createRecipient(
    payload: CreateRecipientInput
  ): Promise<SuccessResponse | null> {
    return jsonRequest<SuccessResponse>(
      "/recipients",
      "POST",
      payload,
      false,
      "none"
    );
  }

  async updateRecipient(
    recipientId: string,
    payload: UpdateRecipientInput
  ): Promise<SuccessResponse | null> {
    return jsonRequest<SuccessResponse>(
      `/recipients/${recipientId}`,
      "PUT",
      payload
    );
  }

  async updateChannel(
    recipientId: string,
    channel: ChannelType,
    payload: ChannelConfig
  ): Promise<SuccessResponse | null> {
    return jsonRequest<SuccessResponse>(
      `/recipients/${recipientId}/channels/${channel}`,
      "POST",
      payload,
      false,
      "none"
    );
  }

  async deleteChannel(
    recipientId: string,
    channel: ChannelType
  ): Promise<SuccessResponse | null> {
    return jsonRequest<SuccessResponse>(
      `/recipients/${recipientId}/channels/${channel}`,
      "DELETE",
      undefined
    );
  }

  async addRecipientAttributeArrayValues(
    recipientId: string,
    attributeKey: string,
    values: Array<string | number>
  ): Promise<SuccessResponse | null> {
    return jsonRequest<SuccessResponse>(
      `/recipients/${recipientId}/attributes/${encodeURIComponent(attributeKey)}/add`,
      "POST",
      { values },
      false,
      "none"
    );
  }

  async removeRecipientAttributeArrayValues(
    recipientId: string,
    attributeKey: string,
    values: Array<string | number>
  ): Promise<SuccessResponse | null> {
    return jsonRequest<SuccessResponse>(
      `/recipients/${recipientId}/attributes/${encodeURIComponent(attributeKey)}/remove`,
      "POST",
      { values },
      false,
      "none"
    );
  }

  async getPreferences(
    recipientId: string
  ): Promise<PreferencesResponse | null> {
    return request<PreferencesResponse>(`/preferences/${recipientId}`, {
      method: "GET",
    });
  }

  async updatePreferences(
    recipientId: string,
    preferences: PreferencesUpdate
  ): Promise<SuccessResponse | null> {
    return jsonRequest<SuccessResponse>(`/preferences/${recipientId}`, "PUT", {
      preferences,
    });
  }

  async setPreference(
    recipientId: string,
    eventType: string,
    channel: ChannelType,
    state: PreferenceState
  ): Promise<SuccessResponse | null> {
    return jsonRequest<SuccessResponse>(
      `/preferences/${recipientId}/set`,
      "POST",
      {
        event_type: eventType,
        channel,
        state,
      },
      false,
      "none"
    );
  }

  async getEventTypes(): Promise<EventTypesResponse | null> {
    return request<EventTypesResponse>("/event-types", { method: "GET" });
  }

  async upsertEventTypesBatch(
    event_types: Array<{
      event_type: string;
      display_name: string;
      description?: string;
      category?: string;
      default_state?: PreferenceState;
      enabled?: boolean;
      metadata?: Record<string, unknown>;
    }>
  ): Promise<BatchCreateEventTypesResponse | null> {
    return jsonRequest<BatchCreateEventTypesResponse>(
      "/event-types/batch",
      "POST",
      {
        event_types,
      },
      false,
      "none"
    );
  }

  async initiateTelegramLinking(
    recipientId: string
  ): Promise<LinkingInitResponse | null> {
    return jsonRequest<LinkingInitResponse>(
      "/link/telegram/initiate",
      "POST",
      {
        recipient_id: recipientId,
      },
      false,
      "none"
    );
  }

  async sendEvent(
    payload: SendEventPayload,
    options?: { idempotencyKey?: string }
  ): Promise<EventAcceptedResponse | null> {
    const headers = options?.idempotencyKey
      ? { "Idempotency-Key": options.idempotencyKey }
      : undefined;
    return jsonRequest<EventAcceptedResponse>(
      "/events",
      "POST",
      payload,
      false,
      "idempotent",
      headers
    );
  }

  async sendBroadcastEvent(
    payload: BroadcastEventPayload,
    options?: { idempotencyKey?: string }
  ): Promise<EventAcceptedResponse | null> {
    const headers = options?.idempotencyKey
      ? { "Idempotency-Key": options.idempotencyKey }
      : undefined;
    return jsonRequest<EventAcceptedResponse>(
      "/events/broadcast",
      "POST",
      payload,
      false,
      "idempotent",
      headers
    );
  }

  async sendCompoundEvent(
    payload: CompoundEventPayload,
    options?: { idempotencyKey?: string }
  ): Promise<EventAcceptedResponse | null> {
    const headers = options?.idempotencyKey
      ? { "Idempotency-Key": options.idempotencyKey }
      : undefined;
    return jsonRequest<EventAcceptedResponse>(
      "/events/compound",
      "POST",
      payload,
      false,
      "idempotent",
      headers
    );
  }

  async initiateEmailVerification(
    recipientId: string
  ): Promise<EmailVerificationInitResponse | null> {
    return jsonRequest<EmailVerificationInitResponse>(
      "/email/verify/initiate",
      "POST",
      {
        recipient_id: recipientId,
      },
      false,
      "none"
    );
  }

  async resendEmailVerification(
    recipientId: string
  ): Promise<EmailVerificationInitResponse | null> {
    return jsonRequest<EmailVerificationInitResponse>(
      "/email/verify/resend",
      "POST",
      {
        recipient_id: recipientId,
      },
      false,
      "none"
    );
  }
}

export const notificationCenterClient = new NotificationCenterClient();
