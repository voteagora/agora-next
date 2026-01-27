import { useState, useEffect, useCallback } from "react";
import { getStoredSiweJwt } from "@/lib/siweSession";

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

async function readErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const data = (await response.json()) as {
      error?: string;
      message?: string;
    };
    if (typeof data?.error === "string" && data.error.trim()) return data.error;
    if (typeof data?.message === "string" && data.message.trim())
      return data.message;
  } catch {
    // ignore
  }

  try {
    const text = await response.text();
    if (text.trim()) return text;
  } catch {
    // ignore
  }

  return fallback;
}

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

      const token = getStoredSiweJwt({ expectedAddress: address });
      if (!token) {
        throw new Error("Please sign in to enable push notifications");
      }

      // 1. Request Permission
      const permissionResult = await Notification.requestPermission();

      setPermission(permissionResult);
      if (permissionResult !== "granted") {
        throw new Error("Permission denied");
      }

      // 2. Fetch VAPID Key from Proxy
      const configRes = await fetch("/api/common/notifications/config");
      if (!configRes.ok) {
        throw new Error(
          await readErrorMessage(configRes, "Failed to fetch VAPID key")
        );
      }

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
      const res = await fetch("/api/common/notifications/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscription }),
      });

      if (!res.ok) {
        await subscription.unsubscribe();
        throw new Error(
          await readErrorMessage(res, "Failed to register push subscription")
        );
      }

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
      const currentSubscription =
        await registration.pushManager.getSubscription();
      if (currentSubscription) {
        await currentSubscription.unsubscribe();
      }

      setIsSubscribed(false);
      setSubscription(null);

      const token = getStoredSiweJwt();
      if (!token) {
        throw new Error(
          "Please sign in to finish disabling push notifications"
        );
      }

      const res = await fetch("/api/common/notifications/subscriptions", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(
          await readErrorMessage(res, "Failed to disable push notifications")
        );
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
