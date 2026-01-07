export type ChannelType = "email" | "discord" | "telegram" | "slack" | "pwa";
export type PreferenceState = "on" | "off";
export type Frequency = "instant" | "daily_summary" | "weekly_digest";
export type RecipientType = "wallet_address" | "atlas_user" | "email_only";

export interface EmailChannelConfig {
  type: "email";
  address: string;
  verified: boolean;
}

export interface DiscordChannelConfig {
  type: "discord";
  delivery_type: "webhook";
  webhook_url: string;
}

export interface SlackChannelConfig {
  type: "slack";
  webhook_url: string;
}

export interface TelegramChannelConfig {
  type: "telegram";
  chat_id: string;
  username?: string;
}

export interface PwaChannelConfig {
  type: "pwa";
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export type ChannelConfig =
  | EmailChannelConfig
  | DiscordChannelConfig
  | SlackChannelConfig
  | TelegramChannelConfig
  | PwaChannelConfig;

export interface ChannelConfigs {
  email?: EmailChannelConfig;
  discord?: DiscordChannelConfig;
  slack?: SlackChannelConfig;
  telegram?: TelegramChannelConfig;
  pwa?: PwaChannelConfig;
}

export interface Recipient {
  client_id: string;
  recipient_id: string;
  recipient_type: RecipientType;
  channels?: ChannelConfigs;
  attributes?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PreferenceEntry {
  state: PreferenceState;
  frequency?: Frequency;
  updated_at?: string;
}

export type PreferencesByEvent = Record<
  string,
  Record<ChannelType, PreferenceEntry>
>;

export interface PreferencesResponse {
  client_id: string;
  recipient_id: string;
  preferences: PreferencesByEvent;
  created_at: string | null;
  updated_at: string | null;
}

export interface EventType {
  event_type: string;
  display_name: string;
  description?: string | null;
  category?: string | null;
  default_state: PreferenceState;
  enabled: boolean;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface EventTypesResponse {
  event_types: EventType[];
  count: number;
}

export interface MeResponse {
  client_id: string;
  name: string;
  allowed_channels: ChannelType[];
}

export interface LinkingInitResponse {
  url: string;
  expires_at: string;
  channel: "telegram" | "discord" | "slack";
}

export interface EmailVerificationInitResponse {
  message: string;
  expires_at: string;
}
