"use client";

import { Button } from "@/components/ui/button";
import ChannelStatusBadge, { type ChannelStatus } from "./ChannelStatusBadge";

interface ChannelStatusInfo {
  status: ChannelStatus;
  label?: string;
}

interface TelegramLinkingSectionProps {
  telegramStatus: ChannelStatusInfo;
  username?: string;
  chatId?: string;
  linkingUrl?: string | null;
  expiresAt?: number | null;
  isInitiating: boolean;
  error?: string | null;
  onStartLinking: () => Promise<unknown>;
}

export default function TelegramLinkingSection({
  telegramStatus,
  username,
  chatId,
  linkingUrl,
  expiresAt,
  isInitiating,
  error,
  onStartLinking,
}: TelegramLinkingSectionProps) {
  const isLinked = !!chatId;
  const expiresInMinutes =
    expiresAt && !isLinked
      ? Math.max(0, Math.ceil((expiresAt - Date.now()) / 60000))
      : null;

  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-newDefault">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Telegram</h2>
          <ChannelStatusBadge
            status={telegramStatus.status}
            label={telegramStatus.label}
          />
        </div>
        <p className="text-sm text-secondary">
          Link Telegram to receive priority alerts on mobile.
        </p>
      </div>

      {isLinked ? (
        <div className="mt-4 rounded-xl border border-line bg-neutral/40 p-4">
          <div className="text-sm font-semibold text-primary">
            Linked as {username ? `@${username}` : "Telegram user"}
          </div>
          <div className="mt-1 text-xs text-tertiary">Chat ID: {chatId}</div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {linkingUrl ? (
            <div className="rounded-xl border border-line bg-neutral/40 p-4">
              <div className="text-sm font-semibold text-primary">
                Complete linking in Telegram
              </div>
              <p className="mt-1 text-xs text-tertiary">
                {expiresInMinutes !== null
                  ? `Link expires in ${expiresInMinutes} minute${expiresInMinutes === 1 ? "" : "s"}.`
                  : "Link is active."}
              </p>
              <Button
                size="sm"
                className="mt-3"
                onClick={() =>
                  window.open(linkingUrl, "_blank", "noopener,noreferrer")
                }
              >
                Open Telegram
              </Button>
            </div>
          ) : null}

          {error ? <p className="text-xs text-negative">{error}</p> : null}

          <Button
            size="sm"
            variant="elevatedOutline"
            disabled={isInitiating}
            onClick={async () => {
              try {
                await onStartLinking();
              } catch {
                return;
              }
            }}
          >
            {isInitiating ? "Starting..." : "Link Telegram"}
          </Button>
        </div>
      )}
    </section>
  );
}
