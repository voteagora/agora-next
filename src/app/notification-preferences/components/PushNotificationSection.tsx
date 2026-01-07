"use client";

import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import ChannelStatusBadge, { type ChannelStatus } from "./ChannelStatusBadge";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface PushNotificationSectionProps {
  status: ChannelStatus;
}

export default function PushNotificationSection({
  status,
}: PushNotificationSectionProps) {
  const { address } = useAccount();
  const { subscribe, unsubscribe, loading, error, isSubscribed } =
    usePushNotifications();

  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-newDefault">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-primary">
          Push Notifications
        </h2>
        <p className="text-sm text-secondary">
          Receive notifications directly on this device.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">
            Browser Push
          </span>
          <ChannelStatusBadge
            status={status}
            label={status === "connected" ? "Enabled" : "Disabled"}
          />
        </div>

        <div className="flex flex-col gap-2">
          {error && <p className="text-sm text-red-500">{error}</p>}

          {isSubscribed ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-sm text-secondary">
                This device is subscribed to push notifications.
              </span>
              {/* Unsubscribe logic is present in hook but often requires backend coordination or simply clearing local SW */}
              <Button
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={() => unsubscribe()}
              >
                {loading ? "Unsubscribing..." : "Disable on this device"}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                size="sm"
                variant="elevatedOutline"
                disabled={loading || !address}
                onClick={() => address && subscribe(address)}
              >
                {loading ? "Enabling..." : "Enable Push Notifications"}
              </Button>
            </div>
          )}
          <p className="text-xs text-tertiary">
            This setting is specific to this browser and device.
          </p>
        </div>
      </div>
    </section>
  );
}
