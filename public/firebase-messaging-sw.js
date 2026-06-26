/* eslint-disable no-undef */
/**
 * Service Worker para Firebase Cloud Messaging.
 * Configuração injetada via /firebase-config.js (gerado a partir das variáveis VITE_FIREBASE_*).
 */
importScripts("/firebase-config.js");
importScripts("https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js");

if (self.FIREBASE_CONFIG && self.FIREBASE_CONFIG.apiKey) {
  firebase.initializeApp(self.FIREBASE_CONFIG);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || payload.data?.title || "Semear";
    const options = {
      body: payload.notification?.body || payload.data?.body || "",
      icon: "/brand/android-chrome-192x192.png",
      badge: "/brand/android-chrome-192x192.png",
      data: {
        url: payload.data?.url || "/",
        notificationId: payload.data?.notificationId || "",
        tipo: payload.data?.tipo || "",
      },
    };
    self.registration.showNotification(title, options);
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  const destino = url.startsWith("http") ? url : self.location.origin + url;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(destino);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(destino);
      }
    })
  );
});
