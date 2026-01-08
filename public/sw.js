self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  return self.clients.claim();
});

self.addEventListener("push", function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: data.icon || "/favicon/android-chrome-192x192.png",
      badge: data.badge || "/favicon/favicon-32x32.png",
      vibrate: [100, 50, 100],
      tag: "agora-notification",
      renotify: true,
      requireInteraction: true,
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
        url: data.data?.url || "/",
      },
      actions: data.actions || [],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  } catch (err) {
    console.error("Push Error:", err);
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  // If an action button was clicked, event.action contains the URL (as mapped in backend)
  // Otherwise, fallback to the main notification data.url
  const urlToOpen = event.action || event.notification.data.url;

  if (!urlToOpen) return;

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        // Try to focus an existing window first
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // If no matching window found, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
