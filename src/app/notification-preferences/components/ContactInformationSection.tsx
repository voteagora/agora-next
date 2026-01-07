"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChannelStatusBadge, { type ChannelStatus } from "./ChannelStatusBadge";

function isValidEmail(email: string): boolean {
  if (!email) return true; // Empty is valid (handled by other checks)
  // Basic email validation regex
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
}

function TelegramChannelRow({
  telegramStatus,
  telegram,
}: {
  telegramStatus: ChannelStatusInfo;
  telegram: TelegramInfo;
}) {
  const isLinked = !!telegram.chatId;
  const expiresInMinutes =
    telegram.expiresAt && !isLinked
      ? Math.max(0, Math.ceil((telegram.expiresAt - Date.now()) / 60000))
      : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">
          Telegram
        </span>
        <ChannelStatusBadge
          status={telegramStatus.status}
          label={telegramStatus.label}
        />
      </div>

      {isLinked ? (
        <div className="rounded-xl border border-line bg-neutral/40 p-3">
          <div className="text-sm font-medium text-primary">
            Linked as{" "}
            {telegram.username ? `@${telegram.username}` : "Telegram user"}
          </div>
          <div className="mt-0.5 text-xs text-tertiary">
            Chat ID: {telegram.chatId}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {telegram.linkingUrl ? (
            <div className="rounded-xl border border-line bg-neutral/40 p-3">
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
                className="mt-2"
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

interface ContactInformationSectionProps {
  email: string;
  discordWebhook: string;
  slackWebhook: string;
  emailStatus: ChannelStatusInfo;
  discordStatus: ChannelStatusInfo;
  slackStatus: ChannelStatusInfo;
  telegramStatus: ChannelStatusInfo;
  telegram: TelegramInfo;
  onUpdateEmail: (email: string) => Promise<unknown>;
  onUpdateDiscord: (url: string) => Promise<unknown>;
  onUpdateSlack: (url: string) => Promise<unknown>;
  onSendVerification?: () => Promise<unknown>;
  isUpdatingEmail: boolean;
  isUpdatingDiscord: boolean;
  isUpdatingSlack: boolean;
  isVerifying?: boolean;
  verificationSentAt?: number | null;
}

export default function ContactInformationSection({
  email,
  discordWebhook,
  slackWebhook,
  emailStatus,
  discordStatus,
  slackStatus,
  telegramStatus,
  telegram,
  onUpdateEmail,
  onUpdateDiscord,
  onUpdateSlack,
  onSendVerification,
  isUpdatingEmail,
  isUpdatingDiscord,
  isUpdatingSlack,
  isVerifying,
  verificationSentAt,
}: ContactInformationSectionProps) {
  const [emailValue, setEmailValue] = useState(email);
  const [discordValue, setDiscordValue] = useState(discordWebhook);
  const [slackValue, setSlackValue] = useState(slackWebhook);

  useEffect(() => setEmailValue(email), [email]);
  useEffect(() => setDiscordValue(discordWebhook), [discordWebhook]);
  useEffect(() => setSlackValue(slackWebhook), [slackWebhook]);

  const trimmedEmail = emailValue.trim();
  const trimmedDiscord = discordValue.trim();
  const trimmedSlack = slackValue.trim();

  const emailDirty = trimmedEmail !== email;
  const discordDirty = trimmedDiscord !== discordWebhook;
  const slackDirty = trimmedSlack !== slackWebhook;

  const emailValid = useMemo(() => isValidEmail(trimmedEmail), [trimmedEmail]);
  const showEmailError = trimmedEmail && !emailValid;

  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-newDefault">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-primary">
          Where we&apos;ll notify you
        </h2>
        <p className="text-sm text-secondary">
          Add an email address or webhook to receive notifications.
        </p>
      </div>

      <div className="mt-6 grid gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">
              Email
            </span>
            <ChannelStatusBadge
              status={emailStatus.status}
              label={emailStatus.label}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={emailValue}
              onChange={(event) => setEmailValue(event.target.value)}
              placeholder="you@example.com"
              className="rounded-xl border-line bg-neutral text-primary"
            />
            <Button
              size="sm"
              variant="elevatedOutline"
              disabled={
                !trimmedEmail || !emailDirty || !emailValid || isUpdatingEmail
              }
              onClick={async () => {
                try {
                  await onUpdateEmail(trimmedEmail);
                } catch {
                  return;
                }
              }}
            >
              {isUpdatingEmail ? "Saving..." : "Save"}
            </Button>
          </div>
          {showEmailError && (
            <p className="text-xs text-negative">
              Please enter a valid email address.
            </p>
          )}
          {email && emailStatus.status === "pending" && onSendVerification && (
            <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
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
        </div>

        <TelegramChannelRow
          telegramStatus={telegramStatus}
          telegram={telegram}
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">
              Discord Webhook
            </span>
            <ChannelStatusBadge
              status={discordStatus.status}
              label={discordStatus.label}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={discordValue}
              onChange={(event) => setDiscordValue(event.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="rounded-xl border-line bg-neutral text-primary"
            />
            <Button
              size="sm"
              variant="elevatedOutline"
              disabled={!trimmedDiscord || !discordDirty || isUpdatingDiscord}
              onClick={async () => {
                try {
                  await onUpdateDiscord(trimmedDiscord);
                } catch {
                  return;
                }
              }}
            >
              {isUpdatingDiscord ? "Saving..." : "Save"}
            </Button>
          </div>
          <p className="text-xs text-tertiary">
            Use a Discord channel webhook URL to receive forum updates.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">
              Slack Webhook
            </span>
            <ChannelStatusBadge
              status={slackStatus.status}
              label={slackStatus.label}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={slackValue}
              onChange={(event) => setSlackValue(event.target.value)}
              placeholder="https://hooks.slack.com/..."
              className="rounded-xl border-line bg-neutral text-primary"
            />
            <Button
              size="sm"
              variant="elevatedOutline"
              disabled={!trimmedSlack || !slackDirty || isUpdatingSlack}
              onClick={async () => {
                try {
                  await onUpdateSlack(trimmedSlack);
                } catch {
                  return;
                }
              }}
            >
              {isUpdatingSlack ? "Saving..." : "Save"}
            </Button>
          </div>
          <p className="text-xs text-tertiary">
            Paste a Slack webhook URL to deliver notifications to a channel.
          </p>
        </div>
      </div>
    </section>
  );
}
