self.addEventListener("push", function (event) {
    const options = {
      body: event.data.text(), // Notification message
      icon: "icon.png", // Your icon
      badge: "badge.png", // Your badge image
    };
  
    event.waitUntil(
      self.registration.showNotification("New Notification", options)
    );
});