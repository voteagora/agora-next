"use client";

import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { EVENT_CATEGORIES } from "@/lib/notification-center/eventTypes";
import type {
  ChannelType,
  EventType,
  PreferenceState,
  PreferencesByEvent,
} from "@/lib/notification-center/types";
import type { ChannelStatus } from "./ChannelStatusBadge";
import PreferenceToggle from "./PreferenceToggle";

interface ChannelStatusInfo {
  status: ChannelStatus;
  label?: string;
}

interface PreferencesMatrixProps {
  eventTypes: EventType[];
  preferences: PreferencesByEvent;
  channelOrder: ChannelType[];
  channelStatus: Record<ChannelType, ChannelStatusInfo>;
  renderChannelStatus: (channel: ChannelType) => React.ReactNode;
  onToggle: (
    eventType: string,
    channel: ChannelType,
    nextState: PreferenceState
  ) => void;
  isUpdating: (eventType: string, channel: ChannelType) => boolean;
}

const CATEGORY_LABELS: Map<string, string> = new Map(
  EVENT_CATEGORIES.map((category) => [category.id, category.label])
);

export default function PreferencesMatrix({
  eventTypes,
  preferences,
  channelOrder,
  channelStatus,
  renderChannelStatus,
  onToggle,
  isUpdating,
}: PreferencesMatrixProps) {
  const grouped = new Map<string, EventType[]>();

  eventTypes.forEach((eventType) => {
    const category = eventType.category ?? "other";
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)?.push(eventType);
  });

  const orderedCategories = [
    ...EVENT_CATEGORIES.map((category) => category.id),
    ...Array.from(grouped.keys()).filter(
      (category) => !CATEGORY_LABELS.has(category)
    ),
  ];

  let rowIndex = 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-cardBackground shadow-newDefault">
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed text-sm">
          <thead>
            <tr className="text-left">
              <th className="px-4 py-5 text-xs font-semibold uppercase tracking-wide text-tertiary">
                Event
              </th>
              {channelOrder.map((channel) => (
                <th key={channel} className="px-4 py-5 text-center">
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-primary">
                    {renderChannelStatus(channel)}
                    <span className="capitalize">{channel}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orderedCategories.map((category, categoryIndex) => {
              const items = grouped.get(category) ?? [];
              if (!items.length) return null;

              const label = CATEGORY_LABELS.get(category) ?? category;
              const showTopDivider = categoryIndex === 0;
              const showCategoryDivider =
                categoryIndex === 0 || categoryIndex > 0;

              return (
                <Fragment key={category}>
                  <tr
                    className={cn(
                      "bg-neutral/60",
                      (showTopDivider || showCategoryDivider) &&
                        "border-t border-line",
                      "border-b border-line"
                    )}
                  >
                    <td
                      colSpan={channelOrder.length + 1}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-tertiary"
                    >
                      {label}
                    </td>
                  </tr>
                  {items.map((eventType) => {
                    const stateByChannel =
                      preferences[eventType.event_type] ?? {};
                    const isEven = rowIndex % 2 === 0;
                    rowIndex += 1;

                    return (
                      <tr
                        key={eventType.event_type}
                        className={cn(
                          isEven ? "bg-cardBackground" : "bg-neutral"
                        )}
                      >
                        <td className="px-4 py-4 text-sm">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-secondary">
                              {eventType.display_name}
                            </span>
                            {eventType.description ? (
                              <span className="text-xs text-tertiary">
                                {eventType.description}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        {channelOrder.map((channel) => {
                          const currentState =
                            stateByChannel[channel]?.state ??
                            eventType.default_state ??
                            "off";
                          const checked = currentState === "on";

                          return (
                            <td key={channel} className="px-4 py-3 text-center">
                              <div className="flex justify-center">
                                <PreferenceToggle
                                  checked={checked}
                                  disabled={
                                    channelStatus[channel].status !==
                                    "connected"
                                  }
                                  isLoading={isUpdating(
                                    eventType.event_type,
                                    channel
                                  )}
                                  label={`${eventType.display_name} via ${channel}`}
                                  onChange={(nextValue) =>
                                    onToggle(
                                      eventType.event_type,
                                      channel,
                                      nextValue ? "on" : "off"
                                    )
                                  }
                                />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
