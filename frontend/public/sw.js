self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload;

  try {
    payload = event.data?.json() || {};
  } catch {
    payload = { body: event.data?.text() };
  }

  const title = payload.title || "New message";
  const options = {
    body: payload.body || "Open iMessage to read it.",
    
    // 🌟 CHANGED: Fallback to the dedicated transparent monochrome icon here
    icon: payload.icon || "/notification-monochrome.png", 
    badge: payload.badge || "/notification-monochrome.png",
    
    tag: payload.tag || "new-message",
    renotify: true,
    vibrate: [200, 100, 200],
    data: {
      url: payload.url || "/",
      senderId: payload.senderId,
      messageId: payload.messageId,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existingClient = clients.find((client) => client.url.includes(self.location.origin));

      if (existingClient) {
        existingClient.focus();
        return existingClient.navigate(targetUrl);
      }

      return self.clients.openWindow(targetUrl);
    }),
  );
});