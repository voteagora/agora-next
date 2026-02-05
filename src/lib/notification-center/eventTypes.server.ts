import "server-only";

import { notificationCenterClient } from "@/lib/notification-center/client";
import type { EventType } from "@/lib/notification-center/types";

const EVENT_TYPES_CACHE_TTL_MS = 5 * 60 * 1000;
const EVENT_TYPES_ERROR_CACHE_TTL_MS = 30_000;

type EventTypesCache = {
  value: EventType[];
  expiresAtMs: number;
};

let eventTypesCache: EventTypesCache | null = null;
let eventTypesInflight: Promise<EventType[]> | null = null;

async function computeEventTypes(): Promise<EventType[]> {
  const response = await notificationCenterClient.getEventTypes();
  return response?.event_types ?? [];
}

export async function resolveEventTypes(): Promise<EventType[]> {
  const now = Date.now();
  if (eventTypesCache && now < eventTypesCache.expiresAtMs) {
    return eventTypesCache.value;
  }

  if (eventTypesInflight) {
    return eventTypesInflight;
  }

  eventTypesInflight = (async () => {
    try {
      const value = await computeEventTypes();
      eventTypesCache = {
        value,
        expiresAtMs: Date.now() + EVENT_TYPES_CACHE_TTL_MS,
      };
      return value;
    } catch (error) {
      console.error("Failed to load event types", error);
      eventTypesCache = {
        value: [],
        expiresAtMs: Date.now() + EVENT_TYPES_ERROR_CACHE_TTL_MS,
      };
      return [];
    } finally {
      eventTypesInflight = null;
    }
  })();

  return eventTypesInflight;
}
