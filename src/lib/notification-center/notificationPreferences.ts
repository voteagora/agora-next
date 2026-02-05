import type { EventType, PreferencesResponse, Recipient } from "./types";

export type NotificationSettings = {
  recipient: Recipient | null;
  preferences: PreferencesResponse | null;
  eventTypes: EventType[];
};
