this.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  console.log("Event data is: " + event.data);
  const title = data.title || 'Default Title';
  const options = {
      body: data.body || 'Default body text',
      icon: './images/VNPT_Logo.svg.png', // Notification icon
      badge: './images/VNPT_Logo.svg.png', // Optional: notification badge
      data: "http://localhost:3000/home", 
  };

  console.log('Notification options:', options);

  event.waitUntil(this.registration.showNotification(title, options));
});

this.addEventListener('notificationclick', (event) => {
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