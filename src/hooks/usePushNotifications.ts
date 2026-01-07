import { useState, useEffect, useCallback } from "react";
import Tenant from "@/lib/tenant/tenant";

const URL_BASE64_TO_UINT8_ARRAY = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  subscribe: (address: string) => Promise<void>;
  unsubscribe: () => Promise<void>;
  subscription: PushSubscription | null;
  loading: boolean;
  error: string | null;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      setIsSupported(true);
      setPermission(Notification.permission);

      // Check initial subscription state
      navigator.serviceWorker.ready.then(async (registration) => {
        const sub = await registration.pushManager.getSubscription();
        setIsSubscribed(!!sub);
        setSubscription(sub);
      });
    }
  }, []);

  const subscribe = useCallback(async (address: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!address) throw new Error("Address is required");

      // 1. Request Permission
      const permissionResult = await Notification.requestPermission();

      setPermission(permissionResult);
      if (permissionResult !== "granted") {
        throw new Error("Permission denied");
      }

      // 2. Fetch VAPID Key from Proxy
      const configRes = await fetch("/api/common/notifications/config");
      if (!configRes.ok) throw new Error("Failed to fetch VAPID key");

      const { vapidPublicKey } = await configRes.json();

      if (!vapidPublicKey) {
        throw new Error("VAPID Public Key not found");
      }

      // 3. Register Service Worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // 4. Subscribe
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: URL_BASE64_TO_UINT8_ARRAY(vapidPublicKey),
      });

      // 5. Send to Server (Hub Proxy)
      await fetch("/api/common/notifications/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription, address }),
      });

      setIsSubscribed(true);
      setSubscription(subscription);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to subscribe");
    } finally {
      setLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        // TODO: Notify server about unsubscription
        setIsSubscribed(false);
        setSubscription(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unsubscribe");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    isSupported,
    isSubscribed,
    subscription,
    permission,
    subscribe,
    unsubscribe,
    loading,
    error,
  };
};
