"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { useModal, useSIWE } from "connectkit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import type {
  ChannelType,
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
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import ContactInformationSection, {
  renderStatusIcon,
} from "./ContactInformationSection";
import PreferencesMatrix from "./PreferencesMatrix";
import type { ChannelStatus } from "./ChannelStatusBadge";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useHasPermission } from "@/hooks/useRbacPermissions";

const CHANNEL_ORDER: ChannelType[] = [
  "email",
  "telegram",
  "discord",
  "slack",
  "pwa",
];

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
  const openDialog = useOpenDialog();
  const [telegramLink, setTelegramLink] = useState<TelegramLinkState | null>(
    null
  );
  const [telegramError, setTelegramError] = useState<string | null>(null);
  const [verificationSentAt, setVerificationSentAt] = useState<number | null>(
    null
  );
  const [siweJwt, setSiweJwt] = useState<string | null | undefined>(undefined);
  const [siweError, setSiweError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const pushState = usePushNotifications();
  const { isSubscribed: isPushSubscribed } = pushState;
  const hasAutoSignAttemptedRef = useRef(false);

  // Check if user has grants admin permission
  const { hasPermission: isGrantsAdmin } = useHasPermission(
    "grants",
    "applications",
    "read"
  );

  const recipientId = address?.toLowerCase() ?? "";
  const queryKey = ["notification-settings", recipientId];

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
      eventTypes: [],
    };
  }, [recipientId]);

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
        const parsedBody = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;
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

  const { data, isLoading, isError, error, refetch } = useQuery({
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
      if (
        verificationSentAt &&
        Date.now() - verificationSentAt < 10 * 60 * 1000
      ) {
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
    hasAutoSignAttemptedRef.current = false;

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

  useEffect(() => {
    if (siweJwt) {
      setSiweError(null);
    }
  }, [siweJwt]);

  useEffect(() => {
    if (!isConnected) return;
    if (siweJwt !== null) return;
    if (hasAutoSignAttemptedRef.current) return;

    hasAutoSignAttemptedRef.current = true;
    void (async () => {
      try {
        await ensureSiweSession();
      } catch (error) {
        setSiweError(
          error instanceof Error
            ? error.message
            : "Failed to request signature. Please retry from your wallet."
        );
      }
    })();
  }, [ensureSiweSession, isConnected, siweJwt]);

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

      const preferencesResponse: PreferencesResponse = base.preferences ?? {
        client_id: "",
        recipient_id: recipientId,
        preferences: {},
        created_at: null,
        updated_at: null,
      };

      const existingEvent = preferencesResponse.preferences[eventType] ?? {};

      return {
        ...base,
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
      return await authedFetchJson(
        "/api/v1/notification-preferences/channels/email",
        {
          method: "POST",
          json: { email },
        }
      );
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
    onError: (error, _email, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to update email.";
      toast.error(message);
    },
    onSuccess: () => {
      toast.success("Email updated.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const validateAndSaveDiscordMutation = useMutation({
    mutationFn: async (url: string) => {
      const validationResult = (await authedFetchJson(
        "/api/v1/notification-preferences/channels/validate-webhook",
        {
          method: "POST",
          json: { channel: "discord", url },
        }
      )) as { valid: boolean; errors?: string[] } | null;

      if (!validationResult?.valid) {
        const errorMsg =
          validationResult?.errors?.[0] || "Invalid Discord webhook";
        throw new Error(errorMsg);
      }

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
    onError: (error, _url, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to update Discord webhook.";
      toast.error(message);
    },
    onSuccess: () => {
      toast.success("Discord webhook updated.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const validateAndSaveSlackMutation = useMutation({
    mutationFn: async (url: string) => {
      const validationResult = (await authedFetchJson(
        "/api/v1/notification-preferences/channels/validate-webhook",
        {
          method: "POST",
          json: { channel: "slack", url },
        }
      )) as { valid: boolean; errors?: string[] } | null;

      if (!validationResult?.valid) {
        const errorMsg =
          validationResult?.errors?.[0] || "Invalid Slack webhook";
        throw new Error(errorMsg);
      }

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
    onError: (error, _url, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to update Slack webhook.";
      toast.error(message);
    },
    onSuccess: () => {
      toast.success("Slack webhook updated.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleSlackSave = (url: string) => {
    openDialog({
      type: "CONFIRM",
      params: {
        title: "Test Slack Webhook",
        message:
          "To verify this webhook works, we'll send a test message to your Slack channel. Continue?",
        onConfirm: () => {
          validateAndSaveSlackMutation.mutate(url);
        },
      },
    });
  };

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

      if (
        errorMsg.includes("EMAIL_ALREADY_VERIFIED") ||
        errorMsg.includes("already verified")
      ) {
        message = "Email is already verified.";
      } else if (
        errorMsg.includes("RATE_LIMITED") ||
        errorMsg.includes("429")
      ) {
        message =
          "Too many attempts. Please wait before requesting another email.";
      }

      toast.error(message);
    },
  });

  const deleteChannelMutation = useMutation({
    mutationFn: async (channel: ChannelType) => {
      return await authedFetchJson(
        `/api/v1/notification-preferences/channels/${channel}`,
        { method: "DELETE" }
      );
    },
    onMutate: async (channel) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationSettings>(queryKey);

      updateCachedRecipient((current) => {
        const channels = current.channels ?? {};
        const { [channel]: _, ...remainingChannels } = channels;
        return {
          ...current,
          channels: remainingChannels,
        };
      });

      return { previous, channel };
    },
    onError: (error, channel, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      const message =
        error instanceof Error && error.message
          ? error.message
          : `Failed to disconnect ${channel}.`;
      toast.error(message);
    },
    onSuccess: (_data, channel) => {
      const channelLabels: Record<ChannelType, string> = {
        email: "Email",
        telegram: "Telegram",
        discord: "Discord",
        slack: "Slack",
        pwa: "Push notifications",
      };
      toast.success(`${channelLabels[channel]} disconnected.`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  if (!isConnected) {
    return (
      <main className="mx-auto flex max-w-screen-xl flex-col gap-6 px-4 pb-16 pt-12 lg:px-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold text-primary">
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
      <main className="mx-auto flex max-w-screen-xl flex-col gap-6 px-4 pb-16 pt-12 lg:px-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold text-primary">
            Notification Preferences
          </h1>
          <p className="text-secondary">Loading wallet...</p>
        </div>
      </main>
    );
  }

  if (siweJwt === undefined || siweJwt === null) {
    return (
      <main className="mx-auto flex max-w-screen-xl flex-col gap-6 px-4 pb-16 pt-12 lg:px-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold text-primary">
            Notification Preferences
          </h1>
          <p className="text-secondary">
            Requesting a signature to manage notifications...
          </p>
          {siweError ? (
            <p className="text-sm text-negative">{siweError}</p>
          ) : null}
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex max-w-screen-xl flex-col gap-6 px-4 pb-16 pt-12 lg:px-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold text-primary">
            Notification Preferences
          </h1>
          <p className="text-secondary">Loading your settings...</p>
        </div>
      </main>
    );
  }

  if (isError && !data) {
    const message =
      (error as Error | undefined)?.message ?? "Failed to load settings.";
    return (
      <main className="mx-auto flex max-w-screen-xl flex-col gap-6 px-4 pb-16 pt-12 lg:px-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold text-primary">
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
  const rawEventTypes = data?.eventTypes ?? [];

  // Filter out grants events for non-admin users
  // Grants notifications are admin-only; regular users cannot opt in/out
  // Use category attribute
  const eventTypes = isGrantsAdmin
    ? rawEventTypes
    : rawEventTypes.filter((et) => et.category !== "grants");

  const loadErrorMessage = isError ? ((error as Error)?.message ?? "") : null;

  return (
    <main className="mx-auto flex max-w-screen-xl flex-col gap-8 px-4 pb-16 pt-12 lg:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-extrabold text-primary">
              Notification Preferences
            </h1>
            <p className="text-secondary">
              Customize how you hear about proposals, discussions, and
              engagement.
            </p>
            {loadErrorMessage ? (
              <p className="text-sm text-negative">{loadErrorMessage}</p>
            ) : null}
            {siweError ? (
              <p className="text-sm text-negative">{siweError}</p>
            ) : null}
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

          <ContactInformationSection
            email={recipient?.channels?.email?.address ?? ""}
            discordWebhook={recipient?.channels?.discord?.webhook_url ?? ""}
            slackWebhook={recipient?.channels?.slack?.webhook_url ?? ""}
            emailStatus={channelStatus.email}
            discordStatus={channelStatus.discord}
            slackStatus={channelStatus.slack}
            telegramStatus={channelStatus.telegram}
            pwaStatus={channelStatus.pwa}
            telegram={{
              username: recipient?.channels?.telegram?.username,
              chatId: recipient?.channels?.telegram?.chat_id,
              linkingUrl: telegramLink?.url,
              expiresAt: telegramLink?.expiresAt,
              isInitiating: telegramLinkMutation.isPending,
              error: telegramError,
              onStartLinking: telegramLinkMutation.mutateAsync,
              onUnlink: () => deleteChannelMutation.mutateAsync("telegram"),
            }}
            onUpdateEmail={updateEmailMutation.mutateAsync}
            onUpdateDiscord={validateAndSaveDiscordMutation.mutateAsync}
            onUpdateSlack={handleSlackSave}
            onSendVerification={emailVerificationMutation.mutateAsync}
            onUnlinkEmail={() => deleteChannelMutation.mutateAsync("email")}
            onUnlinkDiscord={() => deleteChannelMutation.mutateAsync("discord")}
            onUnlinkSlack={() => deleteChannelMutation.mutateAsync("slack")}
            onEnablePush={async () => {
              if (!recipientId) {
                throw new Error("Wallet not connected");
              }
              await pushState.subscribe(recipientId);
            }}
            onDisablePush={pushState.unsubscribe}
            isPushSubscribed={pushState.isSubscribed}
            isPushLoading={pushState.loading}
            pushError={pushState.error}
            isUpdatingEmail={updateEmailMutation.isPending}
            isUpdatingDiscord={validateAndSaveDiscordMutation.isPending}
            isUpdatingSlack={validateAndSaveSlackMutation.isPending}
            isVerifying={emailVerificationMutation.isPending}
            verificationSentAt={verificationSentAt}
            unlinkingChannel={
              deleteChannelMutation.isPending
                ? deleteChannelMutation.variables
                : null
            }
          />
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-cardBackground p-6 shadow-newDefault">
            <h2 className="text-lg font-semibold text-primary">
              Welcome to your Notifications Center
            </h2>
            <div className="mt-4 space-y-4 text-sm text-secondary">
              <div className="flex gap-3">
                <span className="text-base leading-6" aria-hidden>
                  🔗
                </span>
                <div className="space-y-1">
                  <p className="font-semibold text-primary">
                    Connect your channels
                  </p>
                  <p>Choose where you’d like to receive updates.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-base leading-6" aria-hidden>
                  🔔
                </span>
                <div className="space-y-1">
                  <p className="font-semibold text-primary">
                    Set your preferences
                  </p>
                  <p>
                    Customize notifications per channel across different
                    categories.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-base leading-6" aria-hidden>
                  🔄
                </span>
                <div className="space-y-1">
                  <p className="font-semibold text-primary">Manage anytime</p>
                  <p>
                    Update or disconnect channels whenever you need - your
                    preferences stay saved.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 border-t border-line pt-4 space-y-2">
              <div className="flex items-center gap-3 text-sm text-secondary">
                {renderStatusIcon("connected", "Connected")}
                <span>Connected</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-secondary">
                {renderStatusIcon("pending", "Pending verification")}
                <span>Pending verification</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-secondary">
                {renderStatusIcon("inactive" as ChannelStatus, "Not connected")}
                <span>Not connected</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <PreferencesMatrix
          eventTypes={eventTypes}
          preferences={preferences}
          channelOrder={CHANNEL_ORDER}
          channelStatus={channelStatus}
          onToggle={(eventType, channel, nextState) =>
            setPreferenceMutation.mutate({
              eventType,
              channel,
              state: nextState,
            })
          }
          isUpdating={(eventType, channel) =>
            setPreferenceMutation.isPending &&
            setPreferenceMutation.variables?.eventType === eventType &&
            setPreferenceMutation.variables?.channel === channel
          }
          renderChannelStatus={(channel) =>
            renderStatusIcon(
              channelStatus[channel].status,
              channelStatus[channel].label
            )
          }
        />
      </div>
    </main>
  );
}
