import "server-only";

import {
  EVENT_TYPE_DEFINITIONS,
  type EventTypeDefinition,
} from "@/lib/notification-center/eventTypes";
import { notificationCenterClient } from "@/lib/notification-center/client";
import type { EventType } from "@/lib/notification-center/types";

function buildFallbackEventType(definition: EventTypeDefinition): EventType {
  const timestamp = new Date().toISOString();
  return {
    event_type: definition.event_type,
    display_name: definition.display_name,
    description: definition.description,
    category: definition.category,
    default_state: definition.default_state,
    enabled: true,
    metadata: null,
    created_at: timestamp,
    updated_at: timestamp,
  };
}

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
  const eventTypes = response?.event_types ?? [];

  if (!eventTypes.length) {
    return EVENT_TYPE_DEFINITIONS.map(buildFallbackEventType);
  }

  const eventTypeMap = new Map(
    eventTypes.map((eventType) => [eventType.event_type, eventType])
  );
  const ordered = EVENT_TYPE_DEFINITIONS.map((definition) => {
    const existing = eventTypeMap.get(definition.event_type);
    if (!existing) {
      return buildFallbackEventType(definition);
    }
    return {
      ...existing,
      description: existing.description ?? definition.description,
      category: definition.category,
      display_name: existing.display_name ?? definition.display_name,
    };
  });

  const extras = eventTypes.filter(
    (eventType) =>
      !EVENT_TYPE_DEFINITIONS.some(
        (definition) => definition.event_type === eventType.event_type
      )
  );

  return [...ordered, ...extras];
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
      const fallback = EVENT_TYPE_DEFINITIONS.map(buildFallbackEventType);
      eventTypesCache = {
        value: fallback,
        expiresAtMs: Date.now() + EVENT_TYPES_ERROR_CACHE_TTL_MS,
      };
      return fallback;
    } finally {
      eventTypesInflight = null;
    }
  })();

  return eventTypesInflight;
}

