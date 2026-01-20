"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import type { ChannelStatus } from "./ChannelStatusBadge";
import type { ChannelType } from "@/lib/notification-center/types";

function isValidEmail(email: string): boolean {
  if (!email) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

interface ChannelStatusInfo {
  status: ChannelStatus;
  label?: string;
}

interface TelegramInfo {
  username?: string;
  chatId?: string;
  linkingUrl?: string | null;
  expiresAt?: number | null;
  isInitiating: boolean;
  error?: string | null;
  onStartLinking: () => Promise<unknown>;
  onUnlink?: () => Promise<unknown>;
}

function ChannelIcon({ type }: { type: "email" | "discord" | "slack" }) {
  if (type === "email") {
    return (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    );
  }
  if (type === "discord") {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
    </svg>
  );
}

function ConnectedChannelCard({
  icon,
  label,
  value,
  displayValue,
  isEditing,
  isUpdating,
  isUnlinking,
  onEdit,
  onCancelEdit,
  onSave,
  onDisconnect,
  onChange,
  placeholder,
  validationError,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  displayValue?: string;
  isEditing: boolean;
  isUpdating: boolean;
  isUnlinking: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  onChange: (value: string) => void;
  placeholder: string;
  validationError?: string | null;
  children?: React.ReactNode;
}) {
  const openDialog = useOpenDialog();

  const handleDisconnect = () => {
    openDialog({
      type: "CONFIRM",
      params: {
        title: `Disconnect ${label}`,
        message:
          "Your notification preferences will be preserved if you reconnect later.",
        onConfirm: async () => {
          try {
            await onDisconnect();
          } catch {
            return;
          }
        },
      },
    });
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-line bg-wash text-primary placeholder:text-tertiary"
          />
          <div className="flex shrink-0 items-center gap-3">
            <Button
              size="sm"
              variant="elevatedOutline"
              disabled={isUpdating}
              onClick={async () => {
                try {
                  await onSave();
                } catch {
                  return;
                }
              }}
            >
              {isUpdating ? "Saving..." : "Save"}
            </Button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="text-sm font-medium text-secondary hover:text-primary"
            >
              Cancel
            </button>
          </div>
        </div>
        {validationError && (
          <p className="text-xs text-negative">{validationError}</p>
        )}
        {children}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-wash p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-wash text-primary">
            {icon}
          </div>
          <span className="truncate text-sm font-medium text-primary">
            {displayValue || value}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={onEdit}
            className="text-xs font-medium text-secondary underline-offset-2 hover:text-primary hover:underline"
          >
            Edit
          </button>
          <span className="text-line">|</span>
          <button
            type="button"
            disabled={isUnlinking}
            onClick={handleDisconnect}
            className="text-xs font-medium text-secondary underline-offset-2 hover:text-negative hover:underline disabled:opacity-50"
          >
            {isUnlinking ? "..." : "Disconnect"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DisconnectedChannelForm({
  value,
  onChange,
  onConnect,
  isConnecting,
  placeholder,
  validationError,
  buttonLabel = "Connect",
}: {
  value: string;
  onChange: (value: string) => void;
  onConnect: () => Promise<void>;
  isConnecting: boolean;
  placeholder: string;
  validationError?: string | null;
  buttonLabel?: string;
}) {
  const trimmed = value.trim();
  const canConnect = trimmed && !validationError;

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-line bg-wash text-primary placeholder:text-tertiary"
        />
        <Button
          size="sm"
          variant="elevatedOutline"
          className="shrink-0"
          disabled={!canConnect || isConnecting}
          onClick={async () => {
            try {
              await onConnect();
            } catch {
              return;
            }
          }}
        >
          {isConnecting ? "Connecting..." : buttonLabel}
        </Button>
      </div>
      {validationError && (
        <p className="text-xs text-negative">{validationError}</p>
      )}
    </div>
  );
}

function TelegramChannelRow({
  telegramStatus,
  telegram,
  isUnlinking,
}: {
  telegramStatus: ChannelStatusInfo;
  telegram: TelegramInfo;
  isUnlinking?: boolean;
}) {
  const openDialog = useOpenDialog();
  const isLinked = !!telegram.chatId;
  const expiresInMinutes =
    telegram.expiresAt && !isLinked
      ? Math.max(0, Math.ceil((telegram.expiresAt - Date.now()) / 60000))
      : null;

  const handleUnlink = () => {
    if (!telegram.onUnlink) return;
    openDialog({
      type: "CONFIRM",
      params: {
        title: "Disconnect Telegram",
        message:
          "Your notification preferences will be preserved if you reconnect later.",
        onConfirm: async () => {
          try {
            await telegram.onUnlink!();
          } catch {
            return;
          }
        },
      },
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {renderStatusIcon(telegramStatus.status, telegramStatus.label)}
        <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">
          Telegram
        </span>
      </div>

      {isLinked ? (
        <div className="rounded-lg border border-line bg-wash p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-wash text-primary">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </div>
              <div className="min-w-0">
                <span className="block truncate text-sm font-medium text-primary">
                  {telegram.username
                    ? `@${telegram.username}`
                    : "Telegram user"}
                </span>
                <span className="block text-xs text-tertiary">
                  Chat ID: {telegram.chatId}
                </span>
              </div>
            </div>
            {telegram.onUnlink && (
              <button
                type="button"
                disabled={isUnlinking}
                onClick={handleUnlink}
                className="shrink-0 text-xs font-medium text-secondary underline-offset-2 hover:text-negative hover:underline disabled:opacity-50"
              >
                {isUnlinking ? "..." : "Disconnect"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {telegram.linkingUrl ? (
            <div className="rounded-lg border border-brandPrimary/20 bg-brandPrimary/5 p-3">
              <div className="text-sm font-medium text-primary">
                Complete linking in Telegram
              </div>
              <p className="mt-0.5 text-xs text-tertiary">
                {expiresInMinutes !== null
                  ? `Link expires in ${expiresInMinutes} minute${expiresInMinutes === 1 ? "" : "s"}.`
                  : "Link is active."}
              </p>
              <Button
                size="sm"
                className="mt-2 h-11 w-full justify-center"
                onClick={() =>
                  window.open(
                    telegram.linkingUrl!,
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                Open Telegram
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="elevatedOutline"
              className="h-11 w-full justify-center"
              disabled={telegram.isInitiating}
              onClick={async () => {
                try {
                  await telegram.onStartLinking();
                } catch {
                  return;
                }
              }}
            >
              {telegram.isInitiating ? "Starting..." : "Link Telegram"}
            </Button>
          )}
          {telegram.error ? (
            <p className="text-xs text-negative">{telegram.error}</p>
          ) : null}
        </div>
      )}

      <p className="text-xs text-tertiary">
        Link Telegram to receive priority alerts on mobile.
      </p>
    </div>
  );
}

function renderStatusIcon(status: ChannelStatus, label?: string) {
  const isConnected = status === "connected";
  const isPending = status === "pending";
  const strokeClass = isConnected
    ? "stroke-positive"
    : isPending
      ? "stroke-secondary"
      : "stroke-tertiary";
  const tooltip = label ?? status;

  return (
    <span
      className="group inline-flex h-6 w-6 items-center justify-center relative"
      title={tooltip}
      aria-label={tooltip}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className={`h-5 w-5 ${strokeClass}`}
        fill="none"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22c5.5228 0 10-4.4772 10-10S17.5228 2 12 2 2 6.4772 2 12s4.4772 10 10 10Z" />
        <path d="M8 12.5 11 15l5-6" />
      </svg>
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
        {tooltip}
      </span>
    </span>
  );
}

interface ContactInformationSectionProps {
  email: string;
  discordWebhook: string;
  slackWebhook: string;
  emailStatus: ChannelStatusInfo;
  discordStatus: ChannelStatusInfo;
  slackStatus: ChannelStatusInfo;
  telegramStatus: ChannelStatusInfo;
  pwaStatus: ChannelStatusInfo;
  telegram: TelegramInfo;
  onUpdateEmail: (email: string) => Promise<unknown>;
  onUpdateDiscord: (url: string) => Promise<unknown>;
  onUpdateSlack: (url: string) => void | Promise<unknown>;
  onSendVerification?: () => Promise<unknown>;
  onUnlinkEmail?: () => Promise<unknown>;
  onUnlinkDiscord?: () => Promise<unknown>;
  onUnlinkSlack?: () => Promise<unknown>;
  onEnablePush: () => Promise<void>;
  onDisablePush: () => Promise<void>;
  isPushSubscribed: boolean;
  isPushLoading: boolean;
  pushError?: string | null;
  isUpdatingEmail: boolean;
  isUpdatingDiscord: boolean;
  isUpdatingSlack: boolean;
  isVerifying?: boolean;
  verificationSentAt?: number | null;
  unlinkingChannel?: ChannelType | null;
}

export default function ContactInformationSection({
  email,
  discordWebhook,
  slackWebhook,
  emailStatus,
  discordStatus,
  slackStatus,
  telegramStatus,
  pwaStatus,
  telegram,
  onUpdateEmail,
  onUpdateDiscord,
  onUpdateSlack,
  onSendVerification,
  onUnlinkEmail,
  onUnlinkDiscord,
  onUnlinkSlack,
  onEnablePush,
  onDisablePush,
  isPushSubscribed,
  isPushLoading,
  pushError,
  isUpdatingEmail,
  isUpdatingDiscord,
  isUpdatingSlack,
  isVerifying,
  verificationSentAt,
  unlinkingChannel,
}: ContactInformationSectionProps) {
  const [emailValue, setEmailValue] = useState(email);
  const [discordValue, setDiscordValue] = useState(discordWebhook);
  const [slackValue, setSlackValue] = useState(slackWebhook);

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingDiscord, setIsEditingDiscord] = useState(false);
  const [isEditingSlack, setIsEditingSlack] = useState(false);

  useEffect(() => {
    setEmailValue(email);
    if (!email) setIsEditingEmail(false);
  }, [email]);

  useEffect(() => {
    setDiscordValue(discordWebhook);
    if (!discordWebhook) setIsEditingDiscord(false);
  }, [discordWebhook]);

  useEffect(() => {
    setSlackValue(slackWebhook);
    if (!slackWebhook) setIsEditingSlack(false);
  }, [slackWebhook]);

  const trimmedEmail = emailValue.trim();
  const trimmedDiscord = discordValue.trim();
  const trimmedSlack = slackValue.trim();

  const emailValid = useMemo(() => isValidEmail(trimmedEmail), [trimmedEmail]);
  const emailValidationError =
    trimmedEmail && !emailValid ? "Please enter a valid email address." : null;

  const isEmailConnected = !!email;
  const isDiscordConnected = !!discordWebhook;
  const isSlackConnected = !!slackWebhook;

  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-newDefault">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-primary">
          Where we&apos;ll notify you
        </h2>
        <p className="text-sm text-secondary">
          Connect your preferred channels to receive notifications.
        </p>
      </div>

      <div className="mt-6 grid gap-6">
        {/* Email Channel */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {renderStatusIcon(emailStatus.status, emailStatus.label)}
            <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">
              Email
            </span>
          </div>

          {isEmailConnected && !isEditingEmail ? (
            <>
              <ConnectedChannelCard
                icon={<ChannelIcon type="email" />}
                label="Email"
                value={emailValue}
                displayValue={email}
                isEditing={false}
                isUpdating={isUpdatingEmail}
                isUnlinking={unlinkingChannel === "email"}
                onEdit={() => setIsEditingEmail(true)}
                onCancelEdit={() => {
                  setIsEditingEmail(false);
                  setEmailValue(email);
                }}
                onSave={async () => {
                  await onUpdateEmail(trimmedEmail);
                  setIsEditingEmail(false);
                }}
                onDisconnect={async () => {
                  if (onUnlinkEmail) await onUnlinkEmail();
                }}
                onChange={setEmailValue}
                placeholder="you@example.com"
                validationError={emailValidationError}
              />
              {emailStatus.status === "pending" && onSendVerification && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isVerifying}
                    onClick={async () => {
                      try {
                        await onSendVerification();
                      } catch {
                        return;
                      }
                    }}
                  >
                    {isVerifying ? "Sending..." : "Send verification email"}
                  </Button>
                  {verificationSentAt && (
                    <span className="text-xs text-tertiary">
                      Verification email sent. Check your inbox.
                    </span>
                  )}
                </div>
              )}
            </>
          ) : isEmailConnected && isEditingEmail ? (
            <ConnectedChannelCard
              icon={<ChannelIcon type="email" />}
              label="Email"
              value={emailValue}
              isEditing={true}
              isUpdating={isUpdatingEmail}
              isUnlinking={unlinkingChannel === "email"}
              onEdit={() => setIsEditingEmail(true)}
              onCancelEdit={() => {
                setIsEditingEmail(false);
                setEmailValue(email);
              }}
              onSave={async () => {
                await onUpdateEmail(trimmedEmail);
                setIsEditingEmail(false);
              }}
              onDisconnect={async () => {
                if (onUnlinkEmail) await onUnlinkEmail();
              }}
              onChange={setEmailValue}
              placeholder="you@example.com"
              validationError={emailValidationError}
            >
              {emailStatus.status === "pending" && onSendVerification && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isVerifying}
                    onClick={async () => {
                      try {
                        await onSendVerification();
                      } catch {
                        return;
                      }
                    }}
                  >
                    {isVerifying ? "Sending..." : "Send verification email"}
                  </Button>
                  {verificationSentAt && (
                    <span className="text-xs text-tertiary">
                      Verification email sent. Check your inbox.
                    </span>
                  )}
                </div>
              )}
            </ConnectedChannelCard>
          ) : (
            <DisconnectedChannelForm
              value={emailValue}
              onChange={setEmailValue}
              onConnect={async () => {
                await onUpdateEmail(trimmedEmail);
              }}
              isConnecting={isUpdatingEmail}
              placeholder="you@example.com"
              validationError={emailValidationError}
            />
          )}
        </div>

        {/* Discord Channel */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {renderStatusIcon(discordStatus.status, discordStatus.label)}
            <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">
              Discord Webhook
            </span>
          </div>

          {isDiscordConnected && !isEditingDiscord ? (
            <ConnectedChannelCard
              icon={<ChannelIcon type="discord" />}
              label="Discord"
              value={discordValue}
              displayValue={maskWebhookUrl(discordWebhook)}
              isEditing={false}
              isUpdating={isUpdatingDiscord}
              isUnlinking={unlinkingChannel === "discord"}
              onEdit={() => setIsEditingDiscord(true)}
              onCancelEdit={() => {
                setIsEditingDiscord(false);
                setDiscordValue(discordWebhook);
              }}
              onSave={async () => {
                await onUpdateDiscord(trimmedDiscord);
                setIsEditingDiscord(false);
              }}
              onDisconnect={async () => {
                if (onUnlinkDiscord) await onUnlinkDiscord();
              }}
              onChange={setDiscordValue}
              placeholder="https://discord.com/api/webhooks/..."
            />
          ) : isDiscordConnected && isEditingDiscord ? (
            <ConnectedChannelCard
              icon={<ChannelIcon type="discord" />}
              label="Discord"
              value={discordValue}
              isEditing={true}
              isUpdating={isUpdatingDiscord}
              isUnlinking={unlinkingChannel === "discord"}
              onEdit={() => setIsEditingDiscord(true)}
              onCancelEdit={() => {
                setIsEditingDiscord(false);
                setDiscordValue(discordWebhook);
              }}
              onSave={async () => {
                await onUpdateDiscord(trimmedDiscord);
                setIsEditingDiscord(false);
              }}
              onDisconnect={async () => {
                if (onUnlinkDiscord) await onUnlinkDiscord();
              }}
              onChange={setDiscordValue}
              placeholder="https://discord.com/api/webhooks/..."
            />
          ) : (
            <DisconnectedChannelForm
              value={discordValue}
              onChange={setDiscordValue}
              onConnect={async () => {
                await onUpdateDiscord(trimmedDiscord);
              }}
              isConnecting={isUpdatingDiscord}
              placeholder="https://discord.com/api/webhooks/..."
            />
          )}

          <p className="text-xs text-tertiary">
            Use a Discord channel webhook URL to receive forum updates.
          </p>
        </div>

        {/* Slack Channel */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {renderStatusIcon(slackStatus.status, slackStatus.label)}
            <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">
              Slack Webhook
            </span>
          </div>

          {isSlackConnected && !isEditingSlack ? (
            <ConnectedChannelCard
              icon={<ChannelIcon type="slack" />}
              label="Slack"
              value={slackValue}
              displayValue={maskWebhookUrl(slackWebhook)}
              isEditing={false}
              isUpdating={isUpdatingSlack}
              isUnlinking={unlinkingChannel === "slack"}
              onEdit={() => setIsEditingSlack(true)}
              onCancelEdit={() => {
                setIsEditingSlack(false);
                setSlackValue(slackWebhook);
              }}
              onSave={async () => {
                await onUpdateSlack(trimmedSlack);
                setIsEditingSlack(false);
              }}
              onDisconnect={async () => {
                if (onUnlinkSlack) await onUnlinkSlack();
              }}
              onChange={setSlackValue}
              placeholder="https://hooks.slack.com/..."
            />
          ) : isSlackConnected && isEditingSlack ? (
            <ConnectedChannelCard
              icon={<ChannelIcon type="slack" />}
              label="Slack"
              value={slackValue}
              isEditing={true}
              isUpdating={isUpdatingSlack}
              isUnlinking={unlinkingChannel === "slack"}
              onEdit={() => setIsEditingSlack(true)}
              onCancelEdit={() => {
                setIsEditingSlack(false);
                setSlackValue(slackWebhook);
              }}
              onSave={async () => {
                await onUpdateSlack(trimmedSlack);
                setIsEditingSlack(false);
              }}
              onDisconnect={async () => {
                if (onUnlinkSlack) await onUnlinkSlack();
              }}
              onChange={setSlackValue}
              placeholder="https://hooks.slack.com/..."
            />
          ) : (
            <DisconnectedChannelForm
              value={slackValue}
              onChange={setSlackValue}
              onConnect={async () => {
                await onUpdateSlack(trimmedSlack);
              }}
              isConnecting={isUpdatingSlack}
              placeholder="https://hooks.slack.com/..."
            />
          )}

          <p className="text-xs text-tertiary">
            Paste a Slack webhook URL to deliver notifications to a channel.
          </p>
        </div>

        {/* Telegram Channel */}
        <TelegramChannelRow
          telegramStatus={telegramStatus}
          telegram={telegram}
          isUnlinking={unlinkingChannel === "telegram"}
        />

        {/* Browser Push */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {renderStatusIcon(pwaStatus.status, pwaStatus.label)}
            <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">
              Browser Push
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="elevatedOutline"
              className="h-11 w-full justify-center"
              disabled={isPushLoading}
              onClick={async () => {
                try {
                  if (isPushSubscribed) {
                    await onDisablePush();
                  } else {
                    await onEnablePush();
                  }
                } catch {
                  return;
                }
              }}
            >
              {isPushLoading
                ? isPushSubscribed
                  ? "Disabling..."
                  : "Enabling..."
                : isPushSubscribed
                  ? "Disable push on this device"
                  : "Enable browser notifications on this device"}
            </Button>
            <p className="text-xs text-tertiary">
              Push notifications are device-specific and require a quick
              signature.
            </p>
            {pushError ? (
              <p className="text-xs text-negative">{pushError}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function maskWebhookUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    if (pathParts.length >= 2) {
      const lastPart = pathParts[pathParts.length - 1];
      const masked =
        lastPart.length > 8
          ? `${lastPart.slice(0, 4)}...${lastPart.slice(-4)}`
          : "****";
      return `${parsed.host}/.../${masked}`;
    }
    return `${parsed.host}/...`;
  } catch {
    return url.length > 30 ? `${url.slice(0, 15)}...${url.slice(-10)}` : url;
  }
}
