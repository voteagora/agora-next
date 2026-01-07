"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useModal, useSIWE } from "connectkit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { EVENT_TYPE_DEFINITIONS } from "@/lib/notification-center/eventTypes";
import type {
  ChannelType,
  EventType,
  PreferenceState,
  PreferencesByEvent,
  PreferencesResponse,
  Recipient,
} from "@/lib/notification-center/types";
import type { NotificationSettings } from "@/lib/notification-center/notificationPreferences";
import {
  clearStoredSiweSession,
  getStoredSiweJwt,
  waitForStoredSiweJwt,
} from "@/lib/siweSession";
import ContactInformationSection from "./ContactInformationSection";
import TelegramLinkingSection from "./TelegramLinkingSection";
import PreferencesMatrix from "./PreferencesMatrix";
import type { ChannelStatus } from "./ChannelStatusBadge";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import PushNotificationSection from "./PushNotificationSection";

const CHANNEL_ORDER: ChannelType[] = ["email", "telegram", "discord", "slack", "pwa"];

type TelegramLinkState = {
  url: string;
  expiresAt: number;
};

type ChannelStatusInfo = {
  status: ChannelStatus;
  label?: string;
};

export default function NotificationPreferencesClient() {
  const { address, isConnected } = useAccount();
  const { setOpen } = useModal();
  const { signIn, signOut } = useSIWE();
  const queryClient = useQueryClient();
  const [telegramLink, setTelegramLink] = useState<TelegramLinkState | null>(null);
  const [telegramError, setTelegramError] = useState<string | null>(null);
  const [verificationSentAt, setVerificationSentAt] = useState<number | null>(null);
  const [siweJwt, setSiweJwt] = useState<string | null | undefined>(undefined);
  const [siweError, setSiweError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { isSubscribed: isPushSubscribed } = usePushNotifications();

  const recipientId = address?.toLowerCase() ?? "";
  const queryKey = ["notification-settings", recipientId];

  const fallbackEventTypes = useMemo<EventType[]>(() => {
    const timestamp = new Date().toISOString();
    return EVENT_TYPE_DEFINITIONS.map((definition) => ({
      event_type: definition.event_type,
      display_name: definition.display_name,
      description: definition.description,
      category: definition.category,
      default_state: definition.default_state,
      enabled: true,
      metadata: null,
      created_at: timestamp,
      updated_at: timestamp,
    }));
  }, []);

  const buildBaseSettings = useCallback((): NotificationSettings => {
    const timestamp = new Date().toISOString();
    return {
      recipient: {
        client_id: "",
        recipient_id: recipientId,
        recipient_type: "wallet_address",
        channels: {},
        attributes: {},
        created_at: timestamp,
        updated_at: timestamp,
      },
      preferences: {
        client_id: "",
        recipient_id: recipientId,
        preferences: {},
        created_at: null,
        updated_at: null,
      },
      eventTypes: fallbackEventTypes,
    };
  }, [fallbackEventTypes, recipientId]);

  const loadSiweJwt = useCallback((): string | null => {
    if (!recipientId) return null;
    return getStoredSiweJwt({ expectedAddress: recipientId });
  }, [recipientId]);

  const clearSiweSession = useCallback(async () => {
    try {
      await signOut();
    } catch {
      clearStoredSiweSession();
    }
    setSiweJwt(null);
  }, [signOut]);

  const ensureSiweSession = useCallback(async () => {
    if (!recipientId) throw new Error("Wallet not connected");

    const existing = loadSiweJwt();
    if (existing) {
      setSiweJwt(existing);
      return existing;
    }

    if (isSigningIn) return null;

    setIsSigningIn(true);
    setSiweError(null);

    try {
      await signIn();
    } catch (error) {
      setSiweError(
        error instanceof Error ? error.message : "Sign-in cancelled."
      );
      return null;
    } finally {
      setIsSigningIn(false);
    }

    let jwt: string | null = null;
    jwt = await waitForStoredSiweJwt({ expectedAddress: recipientId });

    if (!jwt) {
      setSiweError("Unable to load SIWE session. Please try again.");
      return null;
    }

    setSiweJwt(jwt);
    return jwt;
  }, [isSigningIn, loadSiweJwt, recipientId, signIn]);

  const authedFetchJson = useCallback(
    async (
      url: string,
      init: Omit<RequestInit, "body"> & { json?: unknown } = {}
    ): Promise<unknown> => {
      if (!siweJwt) {
        throw new Error("Not authenticated");
      }

      const headers = new Headers(init.headers);
      headers.set("Authorization", `Bearer ${siweJwt}`);

      const body =
        init.json === undefined ? undefined : JSON.stringify(init.json);
      if (body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      const res = await fetch(url, {
        ...init,
        headers,
        body,
      });

      if (res.status === 401) {
        await clearSiweSession();
        throw new Error("Session expired. Please sign in again.");
      }

      if (!res.ok) {
        const parsedBody = (await res.json().catch(() => null)) as
          | { message?: string }
          | null;
        const message =
          typeof parsedBody?.message === "string" && parsedBody.message.trim()
            ? parsedBody.message
            : `${res.status} ${res.statusText}`;
        throw new Error(message);
      }

      if (res.status === 204) return null;

      return (await res.json()) as unknown;
    },
    [clearSiweSession, siweJwt]
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      return (await authedFetchJson(
        "/api/v1/notification-preferences"
      )) as NotificationSettings;
    },
    enabled: Boolean(recipientId && siweJwt),
    refetchInterval: () => {
      // Poll for Telegram linking completion
      if (telegramLink && Date.now() <= telegramLink.expiresAt) {
        return 3000;
      }
      // Poll for email verification completion (5s interval for 10 minutes after sending)
      if (verificationSentAt && Date.now() - verificationSentAt < 10 * 60 * 1000) {
        return 5000;
      }
      return false;
    },
  });

  useEffect(() => {
    setTelegramLink(null);
    setTelegramError(null);
    setVerificationSentAt(null);
    setSiweError(null);
    setSiweJwt(undefined);

    const jwt = loadSiweJwt();
    setSiweJwt(jwt);
  }, [loadSiweJwt, recipientId]);

  useEffect(() => {
    if (!telegramLink) return;

    const remaining = telegramLink.expiresAt - Date.now();
    if (remaining <= 0) {
      setTelegramLink(null);
      setTelegramError("Telegram linking expired. Please try again.");
      return;
    }

    const timeout = setTimeout(() => {
      setTelegramLink(null);
      setTelegramError("Telegram linking expired. Please try again.");
    }, remaining);

    return () => clearTimeout(timeout);
  }, [telegramLink]);

  const recipient = data?.recipient ?? null;

  useEffect(() => {
    if (!telegramLink) return;
    if (!recipient?.channels?.telegram) return;

    setTelegramLink(null);
    setTelegramError(null);
    toast.success("Telegram linked successfully.");
  }, [telegramLink, recipient?.channels?.telegram]);

  // Detect email verification completion
  useEffect(() => {
    if (!verificationSentAt) return;
    if (!recipient?.channels?.email?.verified) return;

    setVerificationSentAt(null);
    toast.success("Email verified successfully!");
  }, [verificationSentAt, recipient?.channels?.email?.verified]);

  const channelStatus = useMemo<Record<ChannelType, ChannelStatusInfo>>(() => {
    const email = recipient?.channels?.email;
    const slack = recipient?.channels?.slack;
    const discord = recipient?.channels?.discord;
    const telegram = recipient?.channels?.telegram;

    return {
      email: email
        ? {
            status: email.verified ? "connected" : "pending",
            label: email.verified ? "Verified" : "Unverified",
          }
        : { status: "disconnected", label: "Not connected" },
      telegram: telegram
        ? { status: "connected", label: "Linked" }
        : { status: "disconnected", label: "Not linked" },
      discord: discord?.webhook_url
        ? { status: "connected", label: "Connected" }
        : { status: "disconnected", label: "Not connected" },
      slack: slack?.webhook_url
        ? { status: "connected", label: "Connected" }
        : { status: "disconnected", label: "Not connected" },
      pwa: isPushSubscribed
        ? { status: "connected", label: "Active" }
        : { status: "disconnected", label: "Inactive" },
    };
  }, [recipient, isPushSubscribed]);

  const updateCachedRecipient = (
    updater: (current: Recipient) => Recipient
  ) => {
    queryClient.setQueryData<NotificationSettings>(queryKey, (current) => {
      const base = current ?? buildBaseSettings();
      const timestamp = new Date().toISOString();
      const existingRecipient = base.recipient ?? {
        client_id: "",
        recipient_id: recipientId,
        recipient_type: "wallet_address",
        channels: {},
        attributes: {},
        created_at: timestamp,
        updated_at: timestamp,
      };

      return {
        ...base,
        eventTypes: base.eventTypes?.length ? base.eventTypes : fallbackEventTypes,
        recipient: updater(existingRecipient),
      };
    });
  };

  const updateCachedPreferences = (
    eventType: string,
    channel: ChannelType,
    state: PreferenceState
  ) => {
    queryClient.setQueryData<NotificationSettings>(queryKey, (current) => {
      const base = current ?? buildBaseSettings();

      const preferencesResponse: PreferencesResponse =
        base.preferences ?? {
          client_id: "",
          recipient_id: recipientId,
          preferences: {},
          created_at: null,
          updated_at: null,
        };

      const existingEvent = preferencesResponse.preferences[eventType] ?? {};

      return {
        ...base,
        eventTypes: base.eventTypes?.length ? base.eventTypes : fallbackEventTypes,
        preferences: {
          ...preferencesResponse,
          preferences: {
            ...preferencesResponse.preferences,
            [eventType]: {
              ...existingEvent,
              [channel]: {
                state,
                updated_at: new Date().toISOString(),
              },
            },
          },
        },
      };
    });
  };

  const updateEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      return await authedFetchJson("/api/v1/notification-preferences/channels/email", {
        method: "POST",
        json: { email },
      });
    },
    onMutate: async (email) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationSettings>(queryKey);

      updateCachedRecipient((current) => ({
        ...current,
        channels: {
          ...current.channels,
          email: {
            type: "email",
            address: email,
            verified: false,
          },
        },
      }));

      return { previous };
    },
    onError: (_error, _email, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error("Failed to update email.");
    },
    onSuccess: () => {
      toast.success("Email updated.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateDiscordMutation = useMutation({
    mutationFn: async (url: string) => {
      return await authedFetchJson(
        "/api/v1/notification-preferences/channels/webhook",
        {
          method: "POST",
          json: { channel: "discord", url },
        }
      );
    },
    onMutate: async (url) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationSettings>(queryKey);

      updateCachedRecipient((current) => ({
        ...current,
        channels: {
          ...current.channels,
          discord: {
            type: "discord",
            delivery_type: "webhook",
            webhook_url: url,
          },
        },
      }));

      return { previous };
    },
    onError: (_error, _url, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error("Failed to update Discord webhook.");
    },
    onSuccess: () => {
      toast.success("Discord webhook updated.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateSlackMutation = useMutation({
    mutationFn: async (url: string) => {
      return await authedFetchJson(
        "/api/v1/notification-preferences/channels/webhook",
        {
          method: "POST",
          json: { channel: "slack", url },
        }
      );
    },
    onMutate: async (url) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationSettings>(queryKey);

      updateCachedRecipient((current) => ({
        ...current,
        channels: {
          ...current.channels,
          slack: {
            type: "slack",
            webhook_url: url,
          },
        },
      }));

      return { previous };
    },
    onError: (_error, _url, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error("Failed to update Slack webhook.");
    },
    onSuccess: () => {
      toast.success("Slack webhook updated.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const setPreferenceMutation = useMutation({
    mutationFn: async ({
      eventType,
      channel,
      state,
    }: {
      eventType: string;
      channel: ChannelType;
      state: PreferenceState;
    }) => {
      return await authedFetchJson(
        "/api/v1/notification-preferences/preferences/set",
        {
          method: "POST",
          json: { eventType, channel, state },
        }
      );
    },
    onMutate: async ({ eventType, channel, state }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationSettings>(queryKey);

      updateCachedPreferences(eventType, channel, state);

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error("Failed to update preference.");
    },
    onSuccess: () => {
      toast.success("Preference updated.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const telegramLinkMutation = useMutation({
    mutationFn: async () => {
      return (await authedFetchJson(
        "/api/v1/notification-preferences/telegram/initiate",
        { method: "POST" }
      )) as { url: string; expires_at: string } | null;
    },
    onSuccess: (response) => {
      if (!response) {
        throw new Error("Failed to start Telegram linking");
      }

      const expiresAt = Date.parse(response.expires_at);
      if (!Number.isFinite(expiresAt)) {
        throw new Error("Invalid Telegram expiration");
      }

      setTelegramError(null);
      setTelegramLink({ url: response.url, expiresAt });
      window.open(response.url, "_blank", "noopener,noreferrer");
      toast.success("Telegram linking started.");
    },
    onError: (error) => {
      console.error(error);
      setTelegramError("Unable to start Telegram linking. Please try again.");
      toast.error("Failed to start Telegram linking.");
    },
  });

  const emailVerificationMutation = useMutation({
    mutationFn: async () => {
      return await authedFetchJson(
        "/api/v1/notification-preferences/email/verify/initiate",
        { method: "POST" }
      );
    },
    onSuccess: (response) => {
      if (!response) {
        throw new Error("Failed to send verification email");
      }
      setVerificationSentAt(Date.now());
      toast.success("Verification email sent. Check your inbox.");
    },
    onError: (error) => {
      console.error(error);
      const errorMsg = error instanceof Error ? error.message : "";
      let message = "Failed to send verification email.";

      if (errorMsg.includes("EMAIL_ALREADY_VERIFIED") || errorMsg.includes("already verified")) {
        message = "Email is already verified.";
      } else if (errorMsg.includes("RATE_LIMITED") || errorMsg.includes("429")) {
        message = "Too many attempts. Please wait before requesting another email.";
      }

      toast.error(message);
    },
  });

  if (!isConnected) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-16 pt-12 lg:px-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-primary">
            Notification Preferences
          </h1>
          <p className="text-secondary">
            Connect your wallet to manage notification settings.
          </p>
        </div>
        <Button className="w-fit" onClick={() => setOpen(true)}>
          Connect wallet
        </Button>
      </main>
    );
  }

  if (!recipientId) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-16 pt-12 lg:px-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-primary">
            Notification Preferences
          </h1>
          <p className="text-secondary">Loading wallet...</p>
        </div>
      </main>
    );
  }

  if (siweJwt === undefined) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-16 pt-12 lg:px-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-primary">
            Notification Preferences
          </h1>
          <p className="text-secondary">Checking your sign-in...</p>
        </div>
      </main>
    );
  }

  if (!siweJwt) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-16 pt-12 lg:px-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-primary">
            Notification Preferences
          </h1>
          <p className="text-secondary">
            Sign in with Ethereum to manage notification settings.
          </p>
          {siweError ? <p className="text-sm text-negative">{siweError}</p> : null}
        </div>
        <Button
          className="w-fit"
          disabled={isSigningIn}
          onClick={async () => {
            try {
              await ensureSiweSession();
            } catch (signInError) {
              setSiweError(
                signInError instanceof Error
                  ? signInError.message
                  : "Sign-in failed."
              );
            }
          }}
        >
          {isSigningIn ? "Signing in..." : "Sign in"}
        </Button>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-16 pt-12 lg:px-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-primary">
            Notification Preferences
          </h1>
          <p className="text-secondary">Loading your settings...</p>
        </div>
      </main>
    );
  }

  if (isError && !data) {
    const message = (error as Error | undefined)?.message ?? "Failed to load settings.";
    return (
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-16 pt-12 lg:px-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-primary">
            Notification Preferences
          </h1>
          <p className="text-sm text-negative">{message}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="elevatedOutline" onClick={() => refetch()}>
            Retry load
          </Button>
        </div>
      </main>
    );
  }

  const preferences: PreferencesByEvent = data?.preferences?.preferences ?? {};
  const eventTypes =
    data?.eventTypes && data.eventTypes.length ? data.eventTypes : fallbackEventTypes;
  const loadErrorMessage = isError ? (error as Error)?.message ?? "" : null;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-16 pt-12 lg:px-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-primary">
            Notification Preferences
          </h1>
          <p className="text-secondary">
            Customize how you hear about proposals, discussions, and engagement.
          </p>
          {loadErrorMessage ? (
            <p className="text-sm text-negative">{loadErrorMessage}</p>
          ) : null}
          {siweError ? <p className="text-sm text-negative">{siweError}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {loadErrorMessage ? (
            <Button
              size="sm"
              variant="elevatedOutline"
              onClick={async () => {
                try {
                  await refetch();
                } catch (retryError) {
                  setSiweError(
                    retryError instanceof Error
                      ? retryError.message
                      : "Unable to refresh settings."
                  );
                }
              }}
            >
              Retry load
            </Button>
          ) : null}
        </div>
      </div>

      <ContactInformationSection
        email={recipient?.channels?.email?.address ?? ""}
        discordWebhook={recipient?.channels?.discord?.webhook_url ?? ""}
        slackWebhook={recipient?.channels?.slack?.webhook_url ?? ""}
        emailStatus={channelStatus.email}
        discordStatus={channelStatus.discord}
        slackStatus={channelStatus.slack}
        onUpdateEmail={updateEmailMutation.mutateAsync}
        onUpdateDiscord={updateDiscordMutation.mutateAsync}
        onUpdateSlack={updateSlackMutation.mutateAsync}
        onSendVerification={emailVerificationMutation.mutateAsync}
        isUpdatingEmail={updateEmailMutation.isPending}
        isUpdatingDiscord={updateDiscordMutation.isPending}
        isUpdatingSlack={updateSlackMutation.isPending}
        isVerifying={emailVerificationMutation.isPending}
        verificationSentAt={verificationSentAt}
      />

      <TelegramLinkingSection
        telegramStatus={channelStatus.telegram}
        username={recipient?.channels?.telegram?.username}
        chatId={recipient?.channels?.telegram?.chat_id}
        linkingUrl={telegramLink?.url}
        expiresAt={telegramLink?.expiresAt}
        isInitiating={telegramLinkMutation.isPending}
        error={telegramError}
        onStartLinking={telegramLinkMutation.mutateAsync}
      />

      <PushNotificationSection status={channelStatus.pwa.status} />

      <PreferencesMatrix
        eventTypes={eventTypes}
        preferences={preferences}
        channelOrder={CHANNEL_ORDER}
        channelStatus={channelStatus}
        onToggle={(eventType, channel, nextState) =>
          setPreferenceMutation.mutate({ eventType, channel, state: nextState })
        }
        isUpdating={(eventType, channel) =>
          setPreferenceMutation.isPending &&
          setPreferenceMutation.variables?.eventType === eventType &&
          setPreferenceMutation.variables?.channel === channel
        }
      />
    </main>
  );
}
