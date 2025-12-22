/* Firebase Cloud Messaging service worker.
   Note: Firebase "web config" values are not secret; this file must be served publicly.
*/

/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyB1vpN3lOkRJy2xAPOhbsR9IAIevNf431c",
  authDomain: "tdm-web.firebaseapp.com",
  projectId: "tdm-web",
  storageBucket: "tdm-web.firebasestorage.app",
  messagingSenderId: "446704632374",
  appId: "1:446704632374:web:3552971c3a3f35615a0e97",
});

const messaging = firebase.messaging();

// Transparent 1x1 icon to avoid showing the site's logo/favicon.
const TRANSPARENT_ICON =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X9o0kAAAAASUVORK5CYII=";

messaging.onBackgroundMessage(function (payload) {
  try {
    const notification = payload.notification || {};
    const title = notification.title || "Notification";
    const options = {
      body: notification.body || "",
      data: payload.data || {},
      icon: TRANSPARENT_ICON,
    };
    self.registration.showNotification(title, options);
  } catch (e) {
    // ignore
  }
});
