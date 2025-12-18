
self.addEventListener('push', function (event) {
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || '/android-chrome-192x192.png',
    badge: '/badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2',
      url: data.data?.url || '/',
    },
    actions: data.data?.actions || [],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        if (clientList.length > 0) {
          let client = clientList[0];
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].focused) {
              client = clientList[i];
            }
          }
          if (client.url === urlToOpen) {
            return client.focus();
          } else {
            return client.navigate(urlToOpen).then((client) => client.focus());
          }
        }
        return clients.openWindow(urlToOpen);
      })
  );
});
