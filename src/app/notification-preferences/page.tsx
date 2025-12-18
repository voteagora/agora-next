"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ChannelKey = "email" | "slack" | "telegram" | "discord";

const preferenceOptions = [
  { key: "proposalCreated", label: "New proposals created" },
  { key: "proposalEnding", label: "Proposal about to end" },
  { key: "discussionCreated", label: "New discussion created" },
  {
    key: "commentEngaged",
    label: "Comment on discussion you're engaged in",
  },
] as const;

type PreferenceKey = (typeof preferenceOptions)[number]["key"];

type PreferenceState = Record<ChannelKey, Record<PreferenceKey, boolean>>;

const initialPreferences: PreferenceState = {
  email: {
    proposalCreated: true,
    proposalEnding: true,
    discussionCreated: true,
    commentEngaged: true,
  },
  slack: {
    proposalCreated: true,
    proposalEnding: true,
    discussionCreated: false,
    commentEngaged: false,
  },
  telegram: {
    proposalCreated: true,
    proposalEnding: false,
    discussionCreated: true,
    commentEngaged: false,
  },
  discord: {
    proposalCreated: true,
    proposalEnding: true,
    discussionCreated: true,
    commentEngaged: true,
  },
};

type ChannelMeta = {
  title: string;
};

const channelMeta: Record<ChannelKey, ChannelMeta> = {
  email: {
    title: "Email",
  },
  slack: {
    title: "Slack",
  },
  telegram: {
    title: "Telegram",
  },
  discord: {
    title: "Discord",
  },
};

type ToggleProps = {
  checked: boolean;
  onChange: (nextValue: boolean) => void;
  label: string;
};

const Toggle = ({ checked, onChange, label }: ToggleProps) => (
  <button
    type="button"
    aria-pressed={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={cn(
      "relative inline-flex h-6 w-11 items-center rounded-full border border-line transition-colors",
      checked ? "bg-primary" : "bg-neutral"
    )}
  >
    <span
      className={cn(
        "inline-block h-4 w-4 transform rounded-full bg-wash shadow-newDefault transition-transform",
        checked ? "translate-x-5" : "translate-x-1"
      )}
    />
  </button>
);

type ChannelInfoProps = {
  channel: ChannelKey;
  meta: ChannelMeta;
  children?: React.ReactNode;
};

const ChannelInfo = ({ meta }: ChannelInfoProps) => (
  <div className="flex flex-col items-center text-center">
    <div className="text-sm font-semibold text-primary">{meta.title}</div>
  </div>
);

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] =
    useState<PreferenceState>(initialPreferences);

  const [contact, setContact] = useState({
    email: "",
    slack: "",
    telegram: "",
    discord: "",
  });

  const setPreference = (
    channel: ChannelKey,
    preference: PreferenceKey,
    nextValue: boolean
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [preference]: nextValue,
      },
    }));
  };

  const channelOrder: ChannelKey[] = ["email", "slack", "telegram", "discord"];

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-16 pt-12 lg:px-0">
      <div className="flex flex-col gap-2">
        <div className="text-3xl font-bold text-primary">
          Notification Preferences
        </div>
        <p className="text-secondary">
          Set your preferences for proposals, discussions, and engagement across
          channels.
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-white p-6 shadow-newDefault">
        <div className="flex items-center justify-between gap-4">
          <div className="text-lg font-semibold text-primary">
            Where we&apos;ll notify you
          </div>
          <Button size="sm" variant="elevatedOutline">
            Update
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">
              Email
            </span>
            <Input
              value={contact.email}
              onChange={(e) =>
                setContact((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="your@email.com"
              className="rounded-xl border-line bg-neutral text-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">
              Slack
            </span>
            <Input
              value={contact.slack}
              onChange={(e) =>
                setContact((prev) => ({ ...prev, slack: e.target.value }))
              }
              placeholder="#governance-updates"
              className="rounded-xl border-line bg-neutral text-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">
              Telegram
            </span>
            <Input
              value={contact.telegram}
              onChange={(e) =>
                setContact((prev) => ({ ...prev, telegram: e.target.value }))
              }
              placeholder="@your-handle"
              className="rounded-xl border-line bg-neutral text-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">
              Discord
            </span>
            <Input
              value={contact.discord}
              onChange={(e) =>
                setContact((prev) => ({ ...prev, discord: e.target.value }))
              }
              placeholder="#governance"
              className="rounded-xl border-line bg-neutral text-primary"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-newDefault">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed text-sm">
            <thead className="bg-neutral">
              <tr className="text-left">
                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-tertiary">
                  Event
                </th>
                {channelOrder.map((channel) => (
                  <th
                    key={channel}
                    className="px-4 py-4 align-middle text-center"
                  >
                    <ChannelInfo
                      channel={channel}
                      meta={channelMeta[channel]}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preferenceOptions.map(({ key, label }, rowIndex) => (
                <tr
                  key={key}
                  className={cn(
                    "border-t border-line",
                    rowIndex % 2 === 0 ? "bg-white" : "bg-neutral/30"
                  )}
                >
                  <td className="px-4 py-4 text-sm font-medium text-secondary">
                    {label}
                  </td>
                  {channelOrder.map((channel) => (
                    <td key={channel} className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        <Toggle
                          checked={preferences[channel][key]}
                          onChange={(nextValue) =>
                            setPreference(channel, key, nextValue)
                          }
                          label={`${label} via ${channelMeta[channel].title}`}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
