self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Default Title';
  const options = {
      body: data.body || 'Default body text',
      icon: '/icon.png', // Notification icon
      badge: '/badge.png', // Optional: notification badge
      data: "http://localhost:3000/home", 
  };

  console.log('Notification options:', options);

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  const url = event.notification.data;
  event.notification.close();

  event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
          const client = clientList.find(client => client.url === url && client.visibilityState === 'visible');
          if (client) {
              return client.focus();
          }
          return clients.openWindow(url);
      })
  );
});